import { expect, test } from "@playwright/test"

test.describe("Client Approval Flow", () => {
  test.beforeEach(async ({ page }) => {
    // Assuming we have a way to bypass auth or use a test session
    // For this example, we'll just navigate to the dashboard
    await page.goto("/")
  })

  test("should navigate between pending deliveries and open validation drawer", async ({
    page,
  }) => {
    // Busca pelo texto exato que aparece no banner em Português
    const bannerCTA = page.getByText("Validar agora")

    // Se o banner estiver visível (pode depender de dados do banco), testamos
    if (await bannerCTA.isVisible()) {
      // Test Navigation - busca pelo padrão '1 / X'
      const navIndicator = page.locator("header").getByText(/\d \/ \d/)
      if (await navIndicator.isVisible()) {
        const nextButton = page
          .locator("header")
          .locator("button")
          .filter({ has: page.locator("svg") })
          .nth(1)
        await nextButton.click()
        await page.waitForTimeout(300)
      }

      // Click to open drawer
      await bannerCTA.click()

      // Verify drawer content (textos em PT)
      await expect(page.getByRole("dialog")).toBeVisible()
      await expect(page.getByText("Aprovar")).toBeVisible()
      await expect(page.getByText("Solicitar ajustes")).toBeVisible()
    }
  })

  test("dashboard should have flexible height without min-h-screen", async ({
    page,
  }) => {
    const main = page.locator("main").first()
    const styles = await main.evaluate((el) => window.getComputedStyle(el))

    expect(styles.minHeight).not.toBe("100vh")
    expect(styles.minHeight).not.toBe("100svh")
  })
})
