import fs from "node:fs"
import path from "node:path"
import { describe, expect, it } from "vitest"
import { z } from "zod"

describe("env schema", () => {
  const envSchema = z.object({
    NEXT_PUBLIC_SITE_URL: z.string().url(),
    NEXT_PUBLIC_GA_ID: z.string().optional(),
    NODE_ENV: z
      .enum(["development", "test", "production"])
      .default("development"),
  })

  it("should validate a correct URL", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: "https://example.com",
    })
    expect(result.success).toBe(true)
  })

  it("should fail on invalid URL", () => {
    const result = envSchema.safeParse({
      NEXT_PUBLIC_SITE_URL: "not-a-url",
    })
    expect(result.success).toBe(false)
  })

  it("should fail when missing required URL", () => {
    const result = envSchema.safeParse({})
    expect(result.success).toBe(false)
  })

  it("does not hardcode a PostgreSQL connection string fallback", () => {
    const envFile = fs.readFileSync(
      path.join(process.cwd(), "src", "config", "env.ts"),
      "utf8"
    )

    expect(envFile).not.toContain("postgresql://")
    expect(envFile).not.toContain("postgres://")
  })
})
