import { test, expect } from "@playwright/test";

test.describe("URL Shortener", () => {
  test("should shorten a URL", async ({ page }) => {
    await page.goto("/");

    await page.fill('[data-testid="url-input"]', "https://www.example.com");

    await page.click('[data-testid="shorten-button"]', {
      force: true,
      timeout: 60000,
    });

    const shortUrlElement = await page.waitForSelector(
      '[data-testid="shortened-url"]'
    );
    const shortUrl = await shortUrlElement.innerText();

    expect(shortUrl).toMatch(
      new RegExp(
        `${
          process.env.NEXT_PUBLIC_URL || "http://localhost:3000"
        }/[a-zA-Z0-9_-]{6,}`
      )
    );
  });

  test("should show error for invalid URL", async ({ page }) => {
    await page.goto("/");

    await page.fill('[data-testid="url-input"]', "not-a-url");

    await page.click('[data-testid="shorten-button"]', {
      force: true,
      timeout: 60000,
    });

    const input = await page.locator('[data-testid="url-input"]');
    expect(
      await input.evaluate((el) => (el as HTMLInputElement).validity.valid)
    ).toBeFalsy();
  });

  test("should redirect to original URL", async ({ page, context }) => {
    await page.goto("/");
    await page.fill('[data-testid="url-input"]', "https://www.example.com");
    await page.click('[data-testid="shorten-button"]', {
      force: true,
      timeout: 60000,
    });

    const shortUrlElement = await page.waitForSelector(
      '[data-testid="shortened-url"]'
    );
    const shortUrl = await shortUrlElement.getAttribute("href");

    const newPage = await context.newPage();
    await newPage.goto(shortUrl as string);

    await expect(newPage).toHaveURL("https://www.example.com/");
  });
});
