import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

test.describe("Security & Redirection Blindage", () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page })
  })

  test("should allow access to public API routes (OG Image)", async ({
    page,
  }) => {
    const response = await page.goto("/api/og")
    expect(response?.status()).toBe(200)
  })

  test("should ensure manifest and robots are public", async ({ page }) => {
    const manifest = await page.goto("/manifest.webmanifest")
    expect(manifest?.status()).toBe(200)

    const robots = await page.goto("/robots.txt")
    expect(robots?.status()).toBe(200)
  })
})
