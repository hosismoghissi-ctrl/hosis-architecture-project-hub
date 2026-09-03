const { test, expect } = require('@playwright/test');

const site = 'http://127.0.0.1:4173';
const storageKey = 'hosisHubPrototypeV1';

async function enterAdmin(page) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
}

async function openProject(page, id = 'hap-2601') {
  await page.locator('[data-view="gallery"]').click();
  await page.locator(`[data-project="${id}"]`).first().click();
}

test('client profiles aggregate lifecycle totals and reuse editable identity data', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="clients"]').click();
  await expect(page.locator('.client-card-metrics').first()).toContainText('Active');
  await page.locator('[data-company]').first().click();
  await expect(page.locator('.client-profile-metrics')).toContainText('Archived Projects');
  await expect(page.locator('.client-company-details')).toContainText('Email');
  const clientName = await page.locator('.company-profile-header h2').textContent();
  await page.getByRole('button', { name: 'Edit Client Profile' }).click();
  await page.locator('#editForm input[name="phone"]').fill('+1 416 555 0199');
  await page.locator('#editForm textarea[name="contacts"]').fill('Jordan Lee | Development Manager | jordan@example.com | +1 416 555 0101');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.client-company-details')).toContainText('+1 416 555 0199');
  await expect(page.locator('.company-contact-panel')).toContainText('Jordan Lee');
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(stored.clients.find(client => client.name === clientName).workspaceId).toBe(stored.activeWorkspaceId);
});

test('meeting categories are editable and visible without changing meeting actions', async ({ page }) => {
  await enterAdmin(page);
  await openProject(page);
  const toggle = page.locator('[data-toggle-project-section="meetings"]');
  if (await toggle.getAttribute('aria-expanded') === 'false') await toggle.click();
  const meeting = page.locator('[data-project-section="meetings"] .meeting-card').first();
  const actionsBefore = await meeting.locator('.meeting-action').count();
  await meeting.getByRole('button', { name: 'Edit meetings record' }).click();
  await page.locator('#editForm select[name="category"]').selectOption('Client Meeting');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('[data-project-section="meetings"] .meeting-category').first()).toHaveText('Client Meeting');
  await expect(page.locator('[data-project-section="meetings"] .meeting-action')).toHaveCount(actionsBefore);
});

test('team overview includes upcoming deadlines and opens the complete member workspace', async ({ page }) => {
  await enterAdmin(page);
  await expect(page.locator('.team-overview-head')).toContainText('Upcoming Deadline');
  await page.locator('.team-overview-row').first().click();
  await expect(page.locator('.member-personal-header')).toContainText('Welcome,');
  await expect(page.locator('#dashboardTasksTitle')).toHaveText('My Tasks Across All Projects');
  await expect(page.getByRole('heading', { name: 'My Deadlines' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Meetings' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Recent Activity' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Schedule' })).toBeVisible();
});

test('workspace-scoped relations are prepared for one-app multi-company data', async ({ page }) => {
  await enterAdmin(page);
  const stored = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), storageKey);
  expect(stored.workspaces).toEqual(expect.arrayContaining([expect.objectContaining({ id: stored.activeWorkspaceId })]));
  expect(stored.projects.every(project => project.workspaceId === stored.activeWorkspaceId)).toBe(true);
  expect(Object.values(stored.members).every(member => member.workspaceId === stored.activeWorkspaceId)).toBe(true);
  expect(stored.clients.every(client => client.workspaceId === stored.activeWorkspaceId)).toBe(true);
  expect(stored.projects.every(project => project.meetings.every(meeting => meeting.workspaceId === stored.activeWorkspaceId))).toBe(true);
  expect(stored.projects.every(project => project.expenses.every(expense => expense.workspaceId === stored.activeWorkspaceId))).toBe(true);
});

test('reusable client logo treatment appears on project cards and project detail', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="gallery"]').click();
  await expect(page.locator('.project-card .project-client-brand').first()).toBeVisible();
  await page.locator('[data-project="hap-2601"]').first().click();
  await expect(page.locator('.project-hero .project-client-brand')).toBeVisible();
});
