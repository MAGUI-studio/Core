import { clerk, setupClerkTestingToken } from "@clerk/testing/playwright"
import { expect, test } from "@playwright/test"

const projectId = process.env.E2E_CLIENT_PROJECT_ID

test.describe("Client portal navigation", () => {
  test.skip(!projectId, "Set E2E_CLIENT_PROJECT_ID to run portal journey tests")

  test.beforeEach(async ({ page }) => {
    await setupClerkTestingToken({ page })
    await clerk.signIn({
      page,
      signInParams: {
        strategy: "email_code",
        identifier: "client+clerk_test@example.com",
      },
    })
  })

  test("uses breadcrumb instead of tab navigation across project sections", async ({
    page,
  }) => {
    await page.goto(`/projects/${projectId}`)

    await expect(
      page.getByRole("navigation", { name: /project navigation|navegacao/i })
    ).toBeVisible()
    await expect(page.getByRole("tab")).toHaveCount(0)

    await page.goto(`/projects/${projectId}/timeline`)

    await expect(
      page.getByRole("navigation", { name: /project navigation|navegacao/i })
    ).toBeVisible()
    await expect(page.getByRole("tab")).toHaveCount(0)
  })
})
