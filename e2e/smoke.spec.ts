// Third-party libraries
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

test("landing renders Playground tiles", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("[data-tile]").first()).toBeVisible();
});

test("dragging the Playground changes which tiles are visible", async ({
  page,
}) => {
  await page.goto("/");
  const tiles = page.locator("[data-tile]");
  await expect(tiles.first()).toBeVisible();
  const keys = () =>
    tiles.evaluateAll((els) =>
      els.map((el) => (el as HTMLElement).dataset.worldX).join(","),
    );
  const before = await keys();

  await page.mouse.move(700, 450);
  await page.mouse.down();
  await page.mouse.move(100, 100, { steps: 15 });
  await page.mouse.up();

  await expect.poll(keys).not.toBe(before);
});

test("?debug opens the tuning panel", async ({ page }) => {
  await page.goto("/?debug");
  await expect(page.getByText("Copy config")).toBeVisible();

  await page.goto("/");
  await expect(page.getByText("Copy config")).toHaveCount(0);
});
