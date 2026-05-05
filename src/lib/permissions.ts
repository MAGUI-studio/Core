import { UserRole } from "@/src/generated/client"
import { auth } from "@clerk/nextjs/server"

export type Role = "admin" | "member" | "client"

const roleMap = {
  admin: UserRole.ADMIN,
  member: UserRole.MEMBER,
  client: UserRole.CLIENT,
} as const

function normalizeRole(role: Role): UserRole {
  return roleMap[role]
}

export function isAdminRole(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN
}

export function isInternalRole(role?: UserRole | null): boolean {
  return role === UserRole.ADMIN || role === UserRole.MEMBER
}

export async function hasRole(role: Role | Role[]): Promise<boolean> {
  const { sessionClaims } = await auth()
  const rawRole = sessionClaims?.metadata?.role
  const userRole =
    typeof rawRole === "string"
      ? normalizeRole(rawRole.toLowerCase() as Role)
      : undefined

  if (!userRole) return false

  if (Array.isArray(role)) {
    return role.map(normalizeRole).includes(userRole)
  }

  return userRole === normalizeRole(role)
}

export async function isAdmin(): Promise<boolean> {
  return hasRole("admin")
}

export async function protectAdmin(): Promise<void> {
  await protect("admin")
}

export async function protectInternal(): Promise<void> {
  await protect(["admin", "member"])
}

export async function protect(role: Role | Role[] = "admin"): Promise<void> {
  const allowed = await hasRole(role)
  if (!allowed) {
    throw new Error("Unauthorized: Insufficient permissions")
  }
}
