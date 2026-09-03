const { test, expect } = require("@playwright/test");

async function openEntry(page) {
  await page.goto("http://127.0.0.1:4173", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Architecture in motion.*Projects under control/i })).toBeVisible();
}

test("admin can navigate projects, tasks, scope and assistant", async ({ page }) => {
  await openEntry(page);
  await page.getByRole("button", { name: /Continue as Admin/i }).click();
  await expect(page.getByRole("heading", { name: /Project intelligence/i })).toBeVisible();

  await page.getByRole("button", { name: /^Projects$/i }).click();
  await expect(page.locator(".project-card")).toHaveCount(12);

  await page.locator(".project-card").first().click();
  await expect(page.locator(".project-hero h1")).toHaveText("Charles Studio Workplace");

  await page.getByRole("button", { name: /Edit Scope/i }).first().click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.getByRole("button", { name: "Cancel" }).click();

  await page.locator("[data-task]").first().click();
  await expect(page.locator(".task-row").first()).toHaveClass(/done/);

  await page.getByRole("button", { name: /AI Assistant/i }).last().click();
  await page.getByRole("button", { name: /Summarize Project Status/i }).click();
  await expect(page.locator(".assistant-message").last()).toContainText("HAP-2601");
});

test("admin can edit records and schedule dates", async ({ page }) => {
  await openEntry(page);
  await page.getByRole("button", { name: /Continue as Admin/i }).click();
  await page.getByRole("button", { name: /^Projects$/i }).click();
  await page.locator(".project-card").first().click();

  await expect(page.locator(".stage-chip")).toHaveCount(6);
  await expect(page.locator(".project-schedule-row")).toHaveCount(6);

  await page.getByRole("button", { name: "Add task", exact: true }).click();
  await page.locator('#editForm input[name="title"]').fill("Coordinate fictional signage package");
  await page.getByRole("button", { name: /Save Changes/i }).click();
  await expect(page.getByText("Coordinate fictional signage package")).toBeVisible();

  await page.getByRole("button", { name: /Add schedule item/i }).click();
  await page.locator('#editForm input[name="start"]').fill("2026-10-01");
  await page.locator('#editForm input[name="end"]').fill("2026-11-15");
  await page.getByRole("button", { name: /Save Changes/i }).click();
  await expect(page.locator(".project-schedule-row")).toHaveCount(7);
});

test("portfolio schedule shows projects and overlapping stage bars", async ({ page }) => {
  await openEntry(page);
  await page.getByRole("button", { name: /Continue as Admin/i }).click();
  await page.getByRole("button", { name: /^Schedule$/i }).click();
  await expect(page.getByRole("heading", { name: "Project Schedule", exact: true })).toBeVisible();
  await expect(page.locator(".timeline-row")).toHaveCount(12);
  await expect(page.locator(".timeline-bar").first()).toBeVisible();
});

test("assigned user sees only their projects", async ({ page }) => {
  await openEntry(page);
  await page.selectOption("#welcomeUser", "maya");
  await page.locator("#continueUser").click();
  await page.getByRole("button", { name: /My Projects/i }).click();
  await expect(page.locator(".project-card")).toHaveCount(5);
  await expect(page.getByRole("button", { name: /Reset Demo Data/i })).toBeHidden();
  await expect(page.getByRole("button", { name: /Members/i })).toBeHidden();
  await expect(page.getByRole("button", { name: /Edit Scope/i })).toHaveCount(0);
  await expect(page.locator("[data-add]")).toHaveCount(0);
});

test("mobile layout does not overflow", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openEntry(page);
  await page.getByRole("button", { name: /Continue as Admin/i }).click();
  const sizes = await page.evaluate(() => ({ scroll: document.documentElement.scrollWidth, client: document.documentElement.clientWidth }));
  expect(sizes.scroll).toBeLessThanOrEqual(sizes.client + 1);
});
