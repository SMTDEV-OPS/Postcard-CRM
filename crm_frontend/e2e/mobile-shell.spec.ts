import { test, expect } from "@playwright/test";
import { assertNoHorizontalPageScroll, loginIfConfigured } from "./helpers/auth";

test.describe("Mobile shell", () => {
  test("login page fits viewport without horizontal scroll", async ({ page }) => {
    await page.goto("/");
    await assertNoHorizontalPageScroll(page);
    await expect(page.getByLabel(/email/i)).toBeVisible();
  });

  test.describe("authenticated routes", () => {
    test.beforeEach(async ({ page }) => {
      const loggedIn = await loginIfConfigured(page);
      test.skip(!loggedIn, "Set PLAYWRIGHT_TEST_EMAIL and PLAYWRIGHT_TEST_PASSWORD to run authenticated mobile smoke tests");
    });

    for (const path of ["/leads", "/calls", "/accounts", "/settings"]) {
      test(`${path} shows mobile nav and has no horizontal scroll`, async ({ page }) => {
        await page.goto(path);
        await page.waitForLoadState("networkidle");
        await expect(page.getByRole("button", { name: "Open navigation menu" })).toBeVisible();
        await assertNoHorizontalPageScroll(page);
      });
    }
  });
});
