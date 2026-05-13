"use server"

import { NotificationType, UserRole } from "@/src/generated/client"
import { UTApi } from "uploadthing/server"

import prisma from "@/src/lib/prisma"
import {
  createAuditLog,
  createNotificationsMany,
  getCurrentAppUser,
  getInternalNotificationRecipients,
} from "@/src/lib/project-governance"
import {
  revalidateMaguiConnectAdminClient,
  revalidateMaguiConnectProfile,
} from "@/src/lib/revalidate"

import {
  type MaguiConnectAdminProfileInput,
  type MaguiConnectLinkInput,
  type MaguiConnectProfileInput,
  type MaguiConnectSectionInput,
} from "../validations/maguiConnect"

const utapi = new UTApi()

async function deleteOldUploadThingFile(
  oldUrl: string | null | undefined,
  newUrl: string | null | undefined
) {
  if (oldUrl && oldUrl !== newUrl && oldUrl.includes("utfs.io")) {
    const fileKey = oldUrl.split("/").pop()
    if (fileKey) {
      try {
        await utapi.deleteFiles(fileKey)
      } catch (error) {
        console.error("Failed to delete old file from UploadThing:", error)
      }
    }
  }
}

async function ensureMaguiConnectAccess(targetUserId?: string) {
  const user = await getCurrentAppUser()
  if (!user) throw new Error("Unauthorized")

  if (
    targetUserId &&
    user.role !== UserRole.ADMIN &&
    user.id !== targetUserId
  ) {
    throw new Error("Unauthorized")
  }

  return { user, targetUserId: targetUserId ?? user.id }
}

function ensureMaguiConnectEnabled(user: {
  canAccessMaguiConnect: boolean
  role: UserRole
}) {
  if (
    user.role !== UserRole.ADMIN &&
    user.role !== UserRole.MEMBER &&
    !user.canAccessMaguiConnect
  ) {
    throw new Error("Magui Connect access not enabled")
  }
}

function toNullable(value?: string | null) {
  if (value === undefined) return undefined
  return value && value.trim().length > 0 ? value.trim() : null
}

function toNullableDate(value?: string | null) {
  const normalized = toNullable(value)
  return normalized ? new Date(normalized) : null
}

function pickProfileFallbacks(input: MaguiConnectAdminProfileInput) {
  const displayName = input.title.trim()
  const headline = toNullable(input.description)
  const bio = toNullable(input.bio)
  const siteName = toNullable(input.siteName) ?? displayName
  const seoTitle = toNullable(input.seoTitle) ?? displayName
  const seoDescription =
    toNullable(input.seoDescription) ?? headline ?? bio ?? null
  const ogImageUrl =
    toNullable(input.ogImageUrl) ??
    toNullable(input.bannerUrl) ??
    toNullable(input.avatarUrl) ??
    null
  const twitterImageUrl = toNullable(input.twitterImageUrl) ?? ogImageUrl
  const companyName =
    toNullable(input.companyName) ??
    (input.entityType === "ORGANIZATION" ? siteName : null)

  return {
    displayName,
    headline,
    bio,
    siteName,
    seoTitle,
    seoDescription,
    ogImageUrl,
    twitterImageUrl,
    companyName,
  }
}

async function ensureProfileUniqueFields(
  targetUserId: string,
  input: Pick<MaguiConnectAdminProfileInput, "slug" | "domain">
) {
  const slug =
    input.slug !== undefined
      ? (toNullable(input.slug)?.toLowerCase() ?? null)
      : undefined
  const domain =
    input.domain !== undefined
      ? (toNullable(input.domain)?.toLowerCase() ?? null)
      : undefined

  if (slug) {
    const slugOwner = await prisma.maguiConnectProfile.findFirst({
      where: {
        slug,
        NOT: { userId: targetUserId },
      },
      select: { id: true },
    })

    if (slugOwner) {
      throw new Error("Este slug nao esta disponivel")
    }
  }

  if (domain) {
    const domainOwner = await prisma.maguiConnectProfile.findFirst({
      where: {
        domain,
        NOT: { userId: targetUserId },
      },
      select: { id: true },
    })

    if (domainOwner) {
      throw new Error("Este dominio nao esta disponivel")
    }
  }

  return { slug, domain }
}

async function ensureOwnProfile(userId: string, fallbackName?: string | null) {
  const profile = await prisma.maguiConnectProfile.findUnique({
    where: { userId },
  })

  if (profile) return profile

  return prisma.maguiConnectProfile.create({
    data: {
      userId,
      displayName: fallbackName?.trim() || "MAGUI Connect",
    },
  })
}

export async function createMaguiConnectProfileForUserAction(
  targetUserId: string
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true },
  })

  if (!targetUser) {
    throw new Error("Cliente nao encontrado")
  }

  const profile = await ensureOwnProfile(targetUser.id, targetUser.name)

  await createAuditLog({
    action: "magui-connect.profile_created",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: `Cadastro do Magui Connect criado manualmente para ${targetUser.name ?? targetUser.email}.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)

  return profile
}

async function saveMaguiConnectProfile(
  targetUserId: string,
  input: MaguiConnectProfileInput | MaguiConnectAdminProfileInput
) {
  const existingProfile = await prisma.maguiConnectProfile.findUnique({
    where: { userId: targetUserId },
    select: {
      id: true,
      slug: true,
      domain: true,
      avatarUrl: true,
      bannerUrl: true,
      faviconUrl: true,
      logoUrl: true,
      ogImageUrl: true,
      twitterImageUrl: true,
    },
  })

  const adminInput = input as Partial<MaguiConnectAdminProfileInput>
  const isAdminInput =
    "indexable" in input ||
    "seoNoFollow" in input ||
    "siteName" in input ||
    "canonicalUrl" in input ||
    "twitterHandle" in input ||
    "themeColor" in input
  const { slug, domain } = await ensureProfileUniqueFields(targetUserId, {
    slug: isAdminInput ? adminInput.slug : undefined,
    domain: isAdminInput ? adminInput.domain : undefined,
  })
  const fallbacks = pickProfileFallbacks({
    title: input.title,
    description: input.description,
    heroKicker: input.heroKicker,
    heroHeadline: input.heroHeadline,
    heroDescription: input.heroDescription,
    bio: input.bio,
    avatarUrl: input.avatarUrl,
    bannerUrl: input.bannerUrl,
    professionalCategory: input.professionalCategory,
    location: input.location,
    companyName: adminInput.companyName,
    publicEmail: input.publicEmail,
    publicPhone: input.publicPhone,
    whatsapp: input.whatsapp,
    whatsappMessage: input.whatsappMessage,
    primaryCtaLabel: input.primaryCtaLabel,
    primaryCtaUrl: input.primaryCtaUrl,
    secondaryCtaLabel: input.secondaryCtaLabel,
    secondaryCtaUrl: input.secondaryCtaUrl,
    themeAccent: input.themeAccent,
    slug: adminInput.slug,
    domain: adminInput.domain,
    siteName: adminInput.siteName,
    faviconUrl: adminInput.faviconUrl,
    logoUrl: adminInput.logoUrl,
    ogImageUrl: adminInput.ogImageUrl,
    twitterImageUrl: adminInput.twitterImageUrl,
    canonicalUrl: adminInput.canonicalUrl,
    locale: adminInput.locale,
    entityType: adminInput.entityType,
    jobTitle: adminInput.jobTitle,
    themeColor: adminInput.themeColor,
    seoTitle: adminInput.seoTitle,
    seoDescription: adminInput.seoDescription,
    seoKeywords: adminInput.seoKeywords,
    twitterHandle: adminInput.twitterHandle,
    indexable: adminInput.indexable ?? true,
    seoNoFollow: adminInput.seoNoFollow ?? false,
  })

  const profileFields = {
    displayName: fallbacks.displayName,
    headline: fallbacks.headline,
    heroKicker: toNullable(input.heroKicker),
    heroHeadline: toNullable(input.heroHeadline),
    heroDescription: toNullable(input.heroDescription),
    bio: fallbacks.bio,
    avatarUrl: toNullable(input.avatarUrl),
    bannerUrl: toNullable(input.bannerUrl),
    professionalCategory: toNullable(input.professionalCategory),
    location: toNullable(input.location),
    publicEmail: toNullable(input.publicEmail),
    publicPhone: toNullable(input.publicPhone),
    whatsapp: toNullable(input.whatsapp),
    whatsappMessage: toNullable(input.whatsappMessage),
    primaryCtaLabel: toNullable(input.primaryCtaLabel),
    primaryCtaUrl: toNullable(input.primaryCtaUrl),
    secondaryCtaLabel: toNullable(input.secondaryCtaLabel),
    secondaryCtaUrl: toNullable(input.secondaryCtaUrl),
    themeAccent: toNullable(input.themeAccent),
    ...(isAdminInput ? { siteName: fallbacks.siteName } : {}),
    ...(adminInput.faviconUrl !== undefined
      ? { faviconUrl: toNullable(adminInput.faviconUrl) }
      : {}),
    ...(adminInput.logoUrl !== undefined
      ? { logoUrl: toNullable(adminInput.logoUrl) }
      : {}),
    ...(adminInput.ogImageUrl !== undefined ||
    adminInput.bannerUrl !== undefined ||
    adminInput.avatarUrl !== undefined
      ? { ogImageUrl: fallbacks.ogImageUrl }
      : {}),
    ...(adminInput.twitterImageUrl !== undefined ||
    adminInput.ogImageUrl !== undefined ||
    adminInput.bannerUrl !== undefined ||
    adminInput.avatarUrl !== undefined
      ? { twitterImageUrl: fallbacks.twitterImageUrl }
      : {}),
    ...(adminInput.canonicalUrl !== undefined
      ? { canonicalUrl: toNullable(adminInput.canonicalUrl) }
      : {}),
    ...(adminInput.locale !== undefined
      ? { locale: toNullable(adminInput.locale) ?? "pt-BR" }
      : {}),
    ...(adminInput.entityType !== undefined
      ? { entityType: adminInput.entityType }
      : {}),
    ...(adminInput.jobTitle !== undefined
      ? { jobTitle: toNullable(adminInput.jobTitle) }
      : {}),
    companyName: isAdminInput
      ? fallbacks.companyName
      : toNullable(input.companyName),
    ...(adminInput.themeColor !== undefined
      ? { themeColor: toNullable(adminInput.themeColor) }
      : {}),
    ...(isAdminInput ? { seoTitle: fallbacks.seoTitle } : {}),
    ...(isAdminInput ? { seoDescription: fallbacks.seoDescription } : {}),
    ...(adminInput.seoKeywords !== undefined
      ? { seoKeywords: toNullable(adminInput.seoKeywords) }
      : {}),
    ...(adminInput.twitterHandle !== undefined
      ? { twitterHandle: toNullable(adminInput.twitterHandle) }
      : {}),
    ...(adminInput.indexable !== undefined
      ? { indexable: adminInput.indexable }
      : {}),
    ...(adminInput.seoNoFollow !== undefined
      ? { seoNoFollow: adminInput.seoNoFollow }
      : {}),
    ...(slug !== undefined
      ? { slug }
      : existingProfile
        ? { slug: existingProfile.slug }
        : {}),
    ...(domain !== undefined
      ? { domain }
      : existingProfile
        ? { domain: existingProfile.domain }
        : {}),
  }

  let result
  if (existingProfile) {
    result = await prisma.maguiConnectProfile.update({
      where: { userId: targetUserId },
      data: profileFields,
    })

    // Cleanup old files from UploadThing
    await Promise.all([
      deleteOldUploadThingFile(
        existingProfile.avatarUrl,
        profileFields.avatarUrl
      ),
      deleteOldUploadThingFile(
        existingProfile.bannerUrl,
        profileFields.bannerUrl
      ),
      deleteOldUploadThingFile(
        existingProfile.faviconUrl,
        "faviconUrl" in profileFields ? profileFields.faviconUrl : undefined
      ),
      deleteOldUploadThingFile(
        existingProfile.logoUrl,
        "logoUrl" in profileFields ? profileFields.logoUrl : undefined
      ),
      deleteOldUploadThingFile(
        existingProfile.ogImageUrl,
        "ogImageUrl" in profileFields ? profileFields.ogImageUrl : undefined
      ),
      deleteOldUploadThingFile(
        existingProfile.twitterImageUrl,
        "twitterImageUrl" in profileFields
          ? profileFields.twitterImageUrl
          : undefined
      ),
    ])
  } else {
    result = await prisma.maguiConnectProfile.create({
      data: {
        userId: targetUserId,
        ...profileFields,
      },
    })
  }

  return result
}

export async function upsertOwnMaguiConnectProfileAction(
  input: MaguiConnectProfileInput
) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const profile = await saveMaguiConnectProfile(user.id, input)

  await createAuditLog({
    action: "magui-connect.profile_updated",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: `Cadastro do Magui Connect atualizado por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return profile
}

export async function upsertMaguiConnectProfileForUserAction(
  targetUserId: string,
  input: MaguiConnectAdminProfileInput
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true, email: true },
  })

  if (!targetUser) {
    throw new Error("Cliente nao encontrado")
  }

  const profile = await saveMaguiConnectProfile(targetUser.id, input)

  await createAuditLog({
    action: "magui-connect.profile_updated_by_admin",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: `Cadastro do Magui Connect de ${targetUser.name ?? targetUser.email} atualizado por admin.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)

  return profile
}

export async function createOwnMaguiConnectLinkAction(
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const profile = await ensureOwnProfile(user.id, user.name)

  const last = await prisma.maguiConnectLink.aggregate({
    where: { profileId: profile.id },
    _max: { sortOrder: true },
  })

  const link = await prisma.maguiConnectLink.create({
    data: {
      profileId: profile.id,
      label: input.label,
      url: input.url,
      customShortDescription: toNullable(input.customShortDescription),
      startsAt: toNullableDate(input.startsAt),
      expiresAt: toNullableDate(input.expiresAt),
      icon: toNullable(input.icon),
      kind: input.kind || "LINK",
      isFeatured: input.isFeatured ?? false,
      openInNewTab: input.openInNewTab ?? true,
      isActive: true,
      sectionId: input.sectionId || null,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  })

  await createAuditLog({
    action: "magui-connect.link_created",
    entityType: "MaguiConnectLink",
    entityId: link.id,
    actorId: user.id,
    summary: `Link do Magui Connect criado por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return link
}

export async function updateOwnMaguiConnectLinkAction(
  linkId: string,
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      icon: true,
      sectionId: true,
      profile: {
        select: {
          userId: true,
        },
      },
    },
  })
  if (!link || link.profile.userId !== user.id)
    throw new Error("Link nao encontrado")

  const updated = await prisma.maguiConnectLink.update({
    where: { id: linkId },
    data: {
      label: input.label,
      url: input.url,
      customShortDescription: toNullable(input.customShortDescription),
      startsAt: toNullableDate(input.startsAt),
      expiresAt: toNullableDate(input.expiresAt),
      icon: toNullable(input.icon),
      kind: input.kind || "LINK",
      isFeatured: input.isFeatured ?? false,
      openInNewTab: input.openInNewTab ?? true,
      isActive: true,
      sectionId:
        input.sectionId !== undefined ? input.sectionId : link.sectionId,
    },
  })

  // Cleanup old icon if changed
  await deleteOldUploadThingFile(link.icon, updated.icon)

  await createAuditLog({
    action: "magui-connect.link_updated",
    entityType: "MaguiConnectLink",
    entityId: updated.id,
    actorId: user.id,
    summary: `Link do Magui Connect atualizado por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return updated
}

export async function deleteOwnMaguiConnectLinkAction(linkId: string) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      icon: true,
      profile: {
        select: {
          userId: true,
        },
      },
    },
  })
  if (!link || link.profile.userId !== user.id)
    throw new Error("Link nao encontrado")

  await prisma.maguiConnectLink.delete({ where: { id: linkId } })

  // Cleanup file from UploadThing
  if (link.icon) {
    await deleteOldUploadThingFile(link.icon, null)
  }

  await createAuditLog({
    action: "magui-connect.link_deleted",
    entityType: "MaguiConnectLink",
    entityId: linkId,
    actorId: user.id,
    summary: `Link do Magui Connect removido por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)
}

export async function reorderOwnMaguiConnectLinksAction(linkIds: string[]) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const profile = await ensureOwnProfile(user.id, user.name)

  await prisma.$transaction(
    linkIds.map((id, index) =>
      prisma.maguiConnectLink.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  await createAuditLog({
    action: "magui-connect.links_reordered",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: "Ordem dos links do Magui Connect atualizada.",
  })

  revalidateMaguiConnectProfile(user.id)
}

export async function createMaguiConnectLinkForUserAction(
  targetUserId: string,
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.findUnique({
    where: { id: targetUserId },
    select: { id: true, name: true },
  })
  if (!targetUser) throw new Error("Cliente nao encontrado")

  const profile = await ensureOwnProfile(targetUser.id, targetUser.name)
  const last = await prisma.maguiConnectLink.aggregate({
    where: { profileId: profile.id },
    _max: { sortOrder: true },
  })

  const link = await prisma.maguiConnectLink.create({
    data: {
      profileId: profile.id,
      label: input.label,
      url: input.url,
      customShortDescription: toNullable(input.customShortDescription),
      startsAt: toNullableDate(input.startsAt),
      expiresAt: toNullableDate(input.expiresAt),
      icon: toNullable(input.icon),
      kind: input.kind || "LINK",
      isFeatured: input.isFeatured ?? false,
      openInNewTab: input.openInNewTab ?? true,
      isActive: true,
      sectionId: input.sectionId || null,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  })

  await createAuditLog({
    action: "magui-connect.link_created_by_admin",
    entityType: "MaguiConnectLink",
    entityId: link.id,
    actorId: user.id,
    summary: `Link do Magui Connect criado por admin para ${targetUser.name ?? targetUser.id}.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)

  return link
}

export async function updateMaguiConnectLinkForUserAction(
  targetUserId: string,
  linkId: string,
  input: MaguiConnectLinkInput
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      icon: true,
      sectionId: true,
      profile: {
        select: {
          userId: true,
        },
      },
    },
  })
  if (!link || link.profile.userId !== targetUserId) {
    throw new Error("Link nao encontrado")
  }

  const updated = await prisma.maguiConnectLink.update({
    where: { id: linkId },
    data: {
      label: input.label,
      url: input.url,
      customShortDescription: toNullable(input.customShortDescription),
      startsAt: toNullableDate(input.startsAt),
      expiresAt: toNullableDate(input.expiresAt),
      icon: toNullable(input.icon),
      kind: input.kind || "LINK",
      isFeatured: input.isFeatured ?? false,
      openInNewTab: input.openInNewTab ?? true,
      isActive: true,
      sectionId:
        input.sectionId !== undefined ? input.sectionId : link.sectionId,
    },
  })

  // Cleanup old icon if changed
  await deleteOldUploadThingFile(link.icon, updated.icon)

  await createAuditLog({
    action: "magui-connect.link_updated_by_admin",
    entityType: "MaguiConnectLink",
    entityId: updated.id,
    actorId: user.id,
    summary: "Link do Magui Connect atualizado por admin.",
  })

  revalidateMaguiConnectProfile(targetUserId)

  return updated
}

export async function deleteMaguiConnectLinkForUserAction(
  targetUserId: string,
  linkId: string
) {
  const { user } = await ensureMaguiConnectAccess(targetUserId)

  if (user.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const link = await prisma.maguiConnectLink.findUnique({
    where: { id: linkId },
    select: {
      id: true,
      icon: true,
      profile: {
        select: {
          userId: true,
        },
      },
    },
  })
  if (!link || link.profile.userId !== targetUserId) {
    throw new Error("Link nao encontrado")
  }

  await prisma.maguiConnectLink.delete({ where: { id: linkId } })

  // Cleanup file from UploadThing
  if (link.icon) {
    await deleteOldUploadThingFile(link.icon, null)
  }

  await createAuditLog({
    action: "magui-connect.link_deleted_by_admin",
    entityType: "MaguiConnectLink",
    entityId: linkId,
    actorId: user.id,
    summary: "Link do Magui Connect removido por admin.",
  })

  revalidateMaguiConnectProfile(targetUserId)
}

// Section Actions

export async function createOwnMaguiConnectSectionAction(
  input: MaguiConnectSectionInput
) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const profile = await ensureOwnProfile(user.id, user.name)

  const last = await prisma.maguiConnectSection.aggregate({
    where: { profileId: profile.id },
    _max: { sortOrder: true },
  })

  const section = await prisma.maguiConnectSection.create({
    data: {
      profileId: profile.id,
      title: input.title,
      description: toNullable(input.description),
      isActive: input.isActive ?? true,
      isCollapsible: input.isCollapsible ?? false,
      sortOrder: (last._max.sortOrder ?? -1) + 1,
    },
  })

  await createAuditLog({
    action: "magui-connect.section_created",
    entityType: "MaguiConnectSection",
    entityId: section.id,
    actorId: user.id,
    summary: `Secao "${section.title}" criada por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return section
}

export async function updateOwnMaguiConnectSectionAction(
  sectionId: string,
  input: MaguiConnectSectionInput
) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const section = await prisma.maguiConnectSection.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      title: true,
      profile: {
        select: {
          userId: true,
        },
      },
    },
  })
  if (!section || section.profile.userId !== user.id)
    throw new Error("Secao nao encontrada")

  const updated = await prisma.maguiConnectSection.update({
    where: { id: sectionId },
    data: {
      title: input.title,
      description: toNullable(input.description),
      isActive: input.isActive ?? true,
      isCollapsible: input.isCollapsible ?? false,
    },
  })

  await createAuditLog({
    action: "magui-connect.section_updated",
    entityType: "MaguiConnectSection",
    entityId: updated.id,
    actorId: user.id,
    summary: `Secao "${updated.title}" atualizada por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)

  return updated
}

export async function deleteOwnMaguiConnectSectionAction(sectionId: string) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const section = await prisma.maguiConnectSection.findUnique({
    where: { id: sectionId },
    select: {
      id: true,
      title: true,
      profile: {
        select: {
          userId: true,
        },
      },
    },
  })
  if (!section || section.profile.userId !== user.id)
    throw new Error("Secao nao encontrada")

  await prisma.maguiConnectSection.delete({ where: { id: sectionId } })

  await createAuditLog({
    action: "magui-connect.section_deleted",
    entityType: "MaguiConnectSection",
    entityId: sectionId,
    actorId: user.id,
    summary: `Secao "${section.title}" removida por ${user.name ?? user.email}.`,
  })

  revalidateMaguiConnectProfile(user.id)
}

export async function reorderOwnMaguiConnectSectionsAction(
  sectionIds: string[]
) {
  const { user } = await ensureMaguiConnectAccess()
  ensureMaguiConnectEnabled(user)
  const profile = await ensureOwnProfile(user.id, user.name)

  await prisma.$transaction(
    sectionIds.map((id, index) =>
      prisma.maguiConnectSection.update({
        where: { id },
        data: { sortOrder: index },
      })
    )
  )

  await createAuditLog({
    action: "magui-connect.sections_reordered",
    entityType: "MaguiConnectProfile",
    entityId: profile.id,
    actorId: user.id,
    summary: "Ordem das secoes do Magui Connect atualizada.",
  })

  revalidateMaguiConnectProfile(user.id)
}

export async function requestMaguiConnectAccessAction() {
  const user = await getCurrentAppUser()
  if (!user) {
    throw new Error("Unauthorized")
  }

  if (user.canAccessMaguiConnect) {
    throw new Error("Magui Connect already enabled")
  }

  const existingRequest = await prisma.notification.findFirst({
    where: {
      type: NotificationType.CONNECT_ACCESS_REQUEST,
      readAt: null,
      metadata: {
        path: ["requesterUserId"],
        equals: user.id,
      },
    },
    select: { id: true },
  })

  if (existingRequest) {
    throw new Error("Access request already sent")
  }

  const recipients = await getInternalNotificationRecipients()

  if (recipients.length > 0) {
    await createNotificationsMany(
      recipients.map((recipient) => ({
        userId: recipient.id,
        type: NotificationType.CONNECT_ACCESS_REQUEST,
        title: "Nova solicitacao de MAGUI Connect",
        message: `${user.name ?? user.email} solicitou liberacao do MAGUI Connect.`,
        ctaPath: "/admin/clients",
        metadata: {
          requesterUserId: user.id,
          requesterEmail: user.email,
        },
      }))
    )
  }

  await createAuditLog({
    action: "magui-connect.access_requested",
    entityType: "User",
    entityId: user.id,
    actorId: user.id,
    summary: `${user.name ?? user.email} solicitou acesso ao MAGUI Connect.`,
  })
}

export async function setMaguiConnectAccessForUserAction(
  targetUserId: string,
  enabled: boolean
) {
  const actor = await getCurrentAppUser()
  if (!actor || actor.role !== UserRole.ADMIN) {
    throw new Error("Unauthorized")
  }

  const targetUser = await prisma.user.update({
    where: { id: targetUserId },
    data: { canAccessMaguiConnect: enabled },
    select: {
      id: true,
      clerkId: true,
      name: true,
      email: true,
      canAccessMaguiConnect: true,
    },
  })

  if (enabled) {
    await ensureOwnProfile(targetUser.id, targetUser.name)
  }

  await createAuditLog({
    action: enabled
      ? "magui-connect.access_enabled"
      : "magui-connect.access_disabled",
    entityType: "User",
    entityId: targetUser.id,
    actorId: actor.id,
    summary: enabled
      ? `Acesso ao MAGUI Connect liberado para ${targetUser.name ?? targetUser.email}.`
      : `Acesso ao MAGUI Connect bloqueado para ${targetUser.name ?? targetUser.email}.`,
  })

  revalidateMaguiConnectProfile(targetUser.id)
  revalidateMaguiConnectAdminClient(targetUser.clerkId)

  return targetUser
}
