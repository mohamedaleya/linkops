import { test, expect } from "@playwright/test";

test.describe.serial("Recent Links", () => {
  test("should display recently shortened URLs", async ({ page }) => {
    await page.goto("/");

    await page.fill('[data-testid="url-input"]', "https://www.example.com");
    await page.click('[data-testid="shorten-button"]', {
      force: true,
      timeout: 60000,
    });

    await page.waitForFunction(
      () => {
        const content = document.querySelector(
          '[data-testid="recent-links"]'
        )?.textContent;
        return content && !content.includes("No shortened links found.");
      },
      { timeout: 60000 }
    );

    const recentLinksContent = await page.textContent(
      '[data-testid="recent-links"]'
    );
    expect(recentLinksContent).toContain("example.com");
  });

  test("should update visit count", async ({ page, context }) => {
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

    await page.reload();

    const visitCount = await page.waitForSelector(
      '[data-testid="visit-count"]'
    );
    const count = await visitCount.textContent();
    expect(Number(count)).toBeGreaterThan(0);
  });
});
