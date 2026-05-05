import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

test.describe("Role-Based Access Control (RBAC)", () => {
  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page })
    await page.goto("/")
  })

  test("should allow admin to access the admin dashboard", async ({ page }) => {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "email_code",
        identifier: "admin+clerk_test@example.com",
      },
    })

    await page.goto("/admin")
    await expect(page).toHaveURL(/\/admin/)
    await expect(page.locator("h1")).toContainText(/Admin/i)
  })

  test("should redirect member to home when accessing admin route", async ({
    page,
  }) => {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "email_code",
        identifier: "member+clerk_test@example.com",
      },
    })

    await page.goto("/admin")
    await expect(page).toHaveURL(/\/$/)
  })

  test("should allow user to sign out and clear session", async ({ page }) => {
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "email_code",
        identifier: "user+clerk_test@example.com",
      },
    })

    await page.goto("/")
    await expect(page).not.toHaveURL(/\/sign-in/)

    await clerk.signOut({ page })
    await page.goto("/")

    await expect(page).toHaveURL(/\/sign-in/)
    await expect(
      page.getByRole("heading", { name: /sign in to magui\.studio/i })
    ).toBeVisible()
  })
})
