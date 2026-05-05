import { UserRole } from "@/src/generated/client"
import { describe, expect, it } from "vitest"

import { isAdminRole, isInternalRole } from "@/src/lib/permissions"

describe("role helpers", () => {
  it("treats only ADMIN as admin", () => {
    expect(isAdminRole(UserRole.ADMIN)).toBe(true)
    expect(isAdminRole(UserRole.MEMBER)).toBe(false)
    expect(isAdminRole(UserRole.CLIENT)).toBe(false)
  })

  it("keeps MEMBER internal without granting admin identity", () => {
    expect(isInternalRole(UserRole.ADMIN)).toBe(true)
    expect(isInternalRole(UserRole.MEMBER)).toBe(true)
    expect(isInternalRole(UserRole.CLIENT)).toBe(false)
  })
})
