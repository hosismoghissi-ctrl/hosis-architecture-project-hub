const { test, expect } = require('@playwright/test');

const site = 'http://127.0.0.1:4173';
const storageKey = 'hosisHubPrototypeV1';

async function enterAdmin(page) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ENTER WORKSPACE' }).click();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
}

test('admin archives and restores a project without deleting its records', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="gallery"]').click();
  await page.locator('[data-project="hap-2601"]').first().click();
  const tasksBefore = await page.locator('[data-task]').count();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Archive Project/i }).click();
  const archived = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601'), storageKey);
  expect(archived.lifecycle).toBe('Archived');
  expect(archived.tasks.length).toBe(tasksBefore);
  await page.getByRole('button', { name: /Projects/i }).first().click();
  await page.getByRole('tab', { name: /Archived Projects/i }).click();
  await expect(page.locator('[data-project="hap-2601"]')).toBeVisible();
  await page.locator('[data-project="hap-2601"]').click();
  page.once('dialog', dialog => dialog.accept());
  await page.getByRole('button', { name: /Restore Project/i }).click();
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601').lifecycle, storageKey)).toBe('Active');
});

test('project sections are accessible accordions and remember state', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="gallery"]').click();
  await page.locator('[data-project="hap-2601"]').first().click();
  await expect(page.locator('[data-project-section]')).toHaveCount(11);
  await page.getByRole('button', { name: /Collapse All/i }).click();
  await expect(page.locator('[data-toggle-project-section][aria-expanded="false"]')).toHaveCount(11);
  await page.locator('[data-toggle-project-section="overview"]').click();
  await expect(page.locator('[data-toggle-project-section="overview"]')).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-view="dashboard"]').click();
  await page.locator('[data-view="gallery"]').click();
  await page.locator('[data-project="hap-2601"]').first().click();
  await expect(page.locator('[data-toggle-project-section="overview"]')).toHaveAttribute('aria-expanded', 'true');
  await expect(page.locator('[data-toggle-project-section="schedule"]')).toHaveAttribute('aria-expanded', 'false');
});

test('schedule supports scales, today, deadlines, avatars and stage resizing controls', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="schedule"]').click();
  await expect(page.locator('.timeline-row')).toHaveCount(12);
  await expect(page.locator('.timeline-avatars img').first()).toBeVisible();
  await expect(page.locator('.timeline-deadline').first()).toBeVisible();
  await expect(page.locator('.timeline-today').first()).toBeVisible();
  await expect(page.locator('[data-resize-stage]').first()).toBeAttached();
  await page.getByRole('button', { name: 'Week', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Week', exact: true })).toHaveAttribute('aria-pressed', 'true');
  const before = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601').schedule[0].end, storageKey);
  await page.locator('[data-stage-project="hap-2601"][data-resize-edge="end"]').first().click();
  const after = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601').schedule[0].end, storageKey);
  expect(after).not.toBe(before);
});

test('admins can add workspace-specific project type subtypes', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="settings"]').click();
  await expect(page.locator('#projectTypeSettings')).toBeVisible();
  await page.getByRole('button', { name: /Add category or subtype/i }).click();
  await page.locator('#editForm input[name="category"]').fill('Residential');
  await page.locator('#editForm input[name="subtype"]').fill('Laneway House');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  const types = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projectTypes, storageKey);
  expect(types.find(type => type.name === 'Residential').subtypes).toContain('Laneway House');
});
