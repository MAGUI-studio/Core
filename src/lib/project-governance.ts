import { revalidatePath, unstable_cache } from "next/cache"

import {
  AuditActorType,
  NotificationType,
  UserRole,
} from "@/src/generated/client"
import { Prisma } from "@/src/generated/client/client"
import { auth, createClerkClient } from "@clerk/nextjs/server"

import { logger } from "@/src/lib/logger"
import prisma from "@/src/lib/prisma"

import { env } from "@/src/config/env"

import { cacheTags } from "./cache-tags"

const clerkAuth = createClerkClient({
  secretKey: env.CLERK_SECRET_KEY,
  publishableKey: env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY,
})

const clerkRoleMap = {
  admin: UserRole.ADMIN,
  member: UserRole.MEMBER,
  client: UserRole.CLIENT,
} as const

function normalizeClerkRole(rawRole: unknown): UserRole {
  if (typeof rawRole !== "string") {
    return UserRole.CLIENT
  }

  return (
    clerkRoleMap[rawRole.toLowerCase() as keyof typeof clerkRoleMap] ??
    UserRole.CLIENT
  )
}

async function upsertUserFromClerk(clerkUserId: string) {
  const client = clerkAuth
  const clerkUser = await client.users.getUser(clerkUserId)
  const primaryEmail =
    clerkUser.emailAddresses.find(
      (email) => email.id === clerkUser.primaryEmailAddressId
    )?.emailAddress ?? clerkUser.emailAddresses[0]?.emailAddress

  if (!primaryEmail) {
    throw new Error("Clerk user is missing a primary email")
  }

  const userData = {
    email: primaryEmail,
    name:
      [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") ||
      clerkUser.fullName ||
      clerkUser.username ||
      primaryEmail,
    role: normalizeClerkRole(clerkUser.publicMetadata?.role),
    avatarUrl: clerkUser.imageUrl ?? null,
  }

  // Simple retry logic for transient connection errors
  let attempts = 0
  const maxAttempts = 3

  while (attempts < maxAttempts) {
    try {
      return await prisma.user.upsert({
        where: { clerkId: clerkUser.id },
        update: userData,
        create: {
          clerkId: clerkUser.id,
          ...userData,
        },
      })
    } catch (error) {
      attempts++
      const isConnectionError =
        error instanceof Error &&
        (error.message.includes("closed the connection") ||
          error.message.includes("socket hang up"))

      if (isConnectionError && attempts < maxAttempts) {
        logger.warn(
          { attempts, clerkUserId },
          "Database connection closed during upsert, retrying..."
        )
        await new Promise((resolve) => setTimeout(resolve, 500 * attempts))
        continue
      }
      throw error
    }
  }

  throw new Error("Unable to sync Clerk user after retries")
}

function splitClientName(
  name: string
): {
  firstName: string
  lastName?: string
} {
  const parts = name.trim().split(/\s+/).filter(Boolean)
  const firstName = parts.shift() ?? "Cliente"
  const lastName = parts.join(" ") || undefined
  return { firstName, lastName }
}

export async function findOrCreateClientFromEmail(
  input: {
    email: string
    name?: string | null
    companyName?: string | null
    username?: string | null
    password?: string | null
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any = prisma
) {
  const email = input.email.trim().toLowerCase()

  if (!email) {
    throw new Error("Client email is required")
  }

  // Path 1: Local user exists
  const localUser = await tx.user.findUnique({
    where: { email },
    select: { id: true, role: true, email: true, companyName: true },
  })

  if (localUser) {
    if (localUser.role !== UserRole.CLIENT) {
      throw new Error("Email belongs to a non-client user")
    }

    // Update company name if missing and provided
    if (input.companyName && !localUser.companyName) {
      return tx.user.update({
        where: { id: localUser.id },
        data: { companyName: input.companyName },
      })
    }

    return localUser
  }

  // Path 2: Clerk lookup and possible creation
  const client = clerkAuth
  const existingClerkUsers = await client.users.getUserList({
    emailAddress: [email],
    limit: 1,
  })
  const existingClerkUser = existingClerkUsers.data[0]

  if (existingClerkUser) {
    await client.users.updateUser(existingClerkUser.id, {
      publicMetadata: {
        ...existingClerkUser.publicMetadata,
        role: "client",
      },
    })

    const userData = {
      email,
      name: input.name?.trim() || existingClerkUser.fullName || email,
      role: UserRole.CLIENT,
      avatarUrl: existingClerkUser.imageUrl ?? null,
      companyName: input.companyName ?? null,
    }

    return tx.user.upsert({
      where: { clerkId: existingClerkUser.id },
      update: userData,
      create: {
        clerkId: existingClerkUser.id,
        ...userData,
      },
    })
  }

  // Path 3: Create new Clerk user and local user
  const displayName = input.name?.trim() || input.companyName?.trim() || email
  const { firstName, lastName } = splitClientName(displayName)

  if (!input.username?.trim() || !input.password?.trim()) {
    throw new Error("Username and password are required for new client access")
  }

  const clerkUser = await client.users.createUser({
    emailAddress: [email],
    username: input.username.trim(),
    firstName,
    ...(lastName ? { lastName } : {}),
    password: input.password.trim(),
    publicMetadata: { role: "client" },
  })

  return tx.user.create({
    data: {
      clerkId: clerkUser.id,
      email,
      name: displayName,
      role: UserRole.CLIENT,
      companyName: input.companyName ?? null,
    },
  })
}

export async function getCurrentAppUser() {
  const { userId } = await auth()

  if (!userId) {
    return null
  }

  return upsertUserFromClerk(userId)
}

export const getInternalNotificationRecipients = unstable_cache(
  async (): Promise<Array<{ id: string }>> => {
    const client = clerkAuth
    const clerkUsers = await client.users.getUserList({ limit: 100 })

    const internalUsers = clerkUsers.data.filter((user) => {
      const role = normalizeClerkRole(user.publicMetadata?.role)
      return role === UserRole.ADMIN || role === UserRole.MEMBER
    })

    if (internalUsers.length === 0) {
      return []
    }

    const syncedUsers = await Promise.all(
      internalUsers.map((user) => upsertUserFromClerk(user.id))
    )

    return syncedUsers.map((user) => ({ id: user.id }))
  },
  ["internal-notification-recipients"],
  {
    revalidate: 3600, // 1 hour
    tags: [cacheTags.adminProjects], // Use a generic admin tag or create one for users
  }
)

export async function ensureProjectAccess(
  projectId: string,
  allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MEMBER, UserRole.CLIENT]
) {
  const user = await getCurrentAppUser()

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      clientId: true,
      members: {
        where: {
          userId: user.id,
        },
        select: {
          id: true,
          role: true,
          userId: true,
        },
      },
      client: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const canAccess =
    user.role === UserRole.ADMIN ||
    user.role === UserRole.MEMBER ||
    project.clientId === user.id ||
    project.members.length > 0

  if (!canAccess) {
    throw new Error("Unauthorized")
  }

  return { user, project }
}

export async function ensureProjectAccessSimple(
  projectId: string,
  allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MEMBER, UserRole.CLIENT]
) {
  const user = await getCurrentAppUser()

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized")
  }

  if (user.role === UserRole.ADMIN || user.role === UserRole.MEMBER) {
    return { user }
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      clientId: true,
      members: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const canAccess = project.clientId === user.id || project.members.length > 0

  if (!canAccess) {
    throw new Error("Unauthorized")
  }

  return { user }
}

export async function ensureProjectAccessWithName(
  projectId: string,
  allowedRoles: UserRole[] = [UserRole.ADMIN, UserRole.MEMBER, UserRole.CLIENT]
) {
  const user = await getCurrentAppUser()

  if (!user || !allowedRoles.includes(user.role)) {
    throw new Error("Unauthorized")
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      id: true,
      name: true,
      clientId: true,
      members: {
        where: { userId: user.id },
        select: { id: true },
      },
    },
  })

  if (!project) {
    throw new Error("Project not found")
  }

  const canAccess =
    user.role === UserRole.ADMIN ||
    user.role === UserRole.MEMBER ||
    project.clientId === user.id ||
    project.members.length > 0

  if (!canAccess) {
    throw new Error("Unauthorized")
  }

  return { user, project: { id: project.id, name: project.name } }
}

export async function enqueueEvent(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  data: {
    type: "NOTIFICATION" | "AUDIT" | "SEARCH_SYNC"
    payload: Prisma.InputJsonValue
  }
) {
  await tx.eventOutbox.create({
    data: {
      type: data.type,
      payload: data.payload,
    },
  })
}

export async function writeAuditAndNotifications(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any,
  data: {
    audit: {
      action: string
      entityType: string
      entityId: string
      summary: string
      metadata?: Prisma.InputJsonValue
      actorId?: string | null
      actorType?: AuditActorType
      projectId?: string | null
    }
    notifications?: Array<{
      userId: string
      type: NotificationType
      title: string
      message: string
      ctaPath?: string | null
      metadata?: Prisma.InputJsonValue
      projectId?: string | null
    }>
  }
) {
  await createAuditLog(data.audit, tx)

  if (data.notifications && data.notifications.length > 0) {
    await createNotificationsMany(data.notifications, tx)
  }
}

export async function createAuditLog(
  data: {
    action: string
    entityType: string
    entityId: string
    summary: string
    metadata?: Prisma.InputJsonValue
    actorId?: string | null
    actorType?: AuditActorType
    projectId?: string | null
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any = prisma
) {
  await tx.auditLog.create({
    data: {
      action: data.action,
      entityType: data.entityType,
      entityId: data.entityId,
      summary: data.summary,
      metadata: data.metadata,
      actorId: data.actorId ?? null,
      actorType: data.actorType ?? AuditActorType.SYSTEM,
      projectId: data.projectId ?? null,
    },
  })
}

export function getAuditOriginLabel(input: {
  actorType?: AuditActorType
  role?: UserRole | null
}): string {
  if (input.actorType === AuditActorType.SYSTEM) {
    return "system"
  }

  if (input.role === UserRole.ADMIN) {
    return "admin_panel"
  }

  if (input.role === UserRole.MEMBER) {
    return "operations_panel"
  }

  return "client_portal"
}

export async function createNotification(
  data: {
    userId: string
    type: NotificationType
    title: string
    message: string
    ctaPath?: string | null
    metadata?: Prisma.InputJsonValue
    projectId?: string | null
  },
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any = prisma
) {
  await tx.notification.create({
    data: {
      userId: data.userId,
      type: data.type,
      title: data.title,
      message: data.message,
      ctaPath: data.ctaPath ?? null,
      metadata: data.metadata,
      projectId: data.projectId ?? null,
    },
  })

  revalidatePath("/", "layout")
  revalidatePath("/admin")
  revalidatePath("/admin/projects")
  if (data.projectId) {
    revalidatePath(`/admin/projects/${data.projectId}`)
  }
}

export async function createNotificationsMany(
  notifications: Array<{
    userId: string
    type: NotificationType
    title: string
    message: string
    ctaPath?: string | null
    metadata?: Prisma.InputJsonValue
    projectId?: string | null
  }>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  tx: any = prisma
) {
  if (notifications.length === 0) return

  await tx.notification.createMany({
    data: notifications.map((n) => ({
      userId: n.userId,
      type: n.type,
      title: n.title,
      message: n.message,
      ctaPath: n.ctaPath ?? null,
      metadata: n.metadata || {},
      projectId: n.projectId ?? null,
    })),
  })

  revalidatePath("/", "layout")
  revalidatePath("/admin")
  revalidatePath("/admin/projects")
  const projectIds = Array.from(
    new Set(notifications.map((n) => n.projectId).filter(Boolean))
  )
  for (const pid of projectIds) {
    revalidatePath(`/admin/projects/${pid}`)
  }
}
