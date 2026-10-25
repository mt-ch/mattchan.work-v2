import { expect, test } from "@playwright/test";

test("landing loads with the theme attribute set", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("robots.txt points at the sitemap", async ({ request }) => {
  const res = await request.get("/robots.txt");
  expect(res.ok()).toBe(true);
  expect(await res.text()).toContain("sitemap.xml");
});

test("sitemap.xml lists the homepage", async ({ request }) => {
  const res = await request.get("/sitemap.xml");
  expect(res.ok()).toBe(true);
  expect(await res.text()).toContain("<urlset");
});

test("landing exposes Open Graph metadata", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator('meta[property="og:title"]')).toHaveCount(1);
});
