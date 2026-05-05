import { setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("should show sign-in screen without public sign-up when signed out", async ({
    page,
  }) => {
    await page.goto("/")

    await expect(page).toHaveURL(/\/sign-in/)
    await expect(
      page.getByRole("heading", { name: /(portal do cliente|client portal)/i })
    ).toBeVisible()
    await expect(page.getByRole("link", { name: /sign up/i })).toHaveCount(0)
  })

  test("should load sign-in page correctly", async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/sign-in")

    await expect(page).toHaveURL(/\/sign-in/)

    const clerkComponent = page.locator(".cl-rootBox")
    await expect(clerkComponent).toBeVisible()
  })

  test("should redirect sign-up route to sign-in", async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/sign-up")

    await expect(page).toHaveURL(/\/sign-in/)

    const clerkComponent = page.locator(".cl-rootBox")
    await expect(clerkComponent).toBeVisible()
  })

  test("should protect admin route and redirect to sign-in", async ({
    page,
  }) => {
    await page.goto("/admin")

    await expect(page).toHaveURL(/\/sign-in/)
  })
})
