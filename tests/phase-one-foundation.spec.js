const { test, expect } = require('@playwright/test');

const site = 'http://127.0.0.1:4173';
const storageKey = 'hosisHubPrototypeV1';

async function enterAdmin(page) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
}

async function enterMember(page, id = 'maya') {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.locator('#welcomeUser').selectOption(id);
  await page.locator('#continueUser').click();
}

test('admin and member navigation are rendered from separate role definitions', async ({ page }) => {
  await enterAdmin(page);
  const adminItems = await page.locator('#roleNavigation [data-view]').evaluateAll(items => items.map(item => item.textContent.trim()));
  expect(adminItems).toEqual(['Dashboard', 'Projects', 'Schedule', 'Tasks', 'Members', 'Clients', 'Consultants', 'Contractors', 'Accounting', 'Files', 'Admin Settings']);
  await expect(page.locator('[data-view="settings"]')).toBeVisible();
  await expect(page.locator('[data-view="expenses"]')).toHaveCount(0);

  await page.getByLabel('Switch role').click();
  await page.locator('#welcomeUser').selectOption('maya');
  await page.locator('#continueUser').click();
  const memberItems = await page.locator('#roleNavigation [data-view]').evaluateAll(items => items.map(item => item.textContent.trim()));
  expect(memberItems).toEqual(['Dashboard', 'My Projects', 'My Tasks', 'Schedule', 'Meetings', 'Expenses', 'Files']);
  await expect(page.locator('[data-view="settings"]')).toHaveCount(0);
  await expect(page.locator('[data-view="members"]')).toHaveCount(0);
});

test('admin settings keep company and personal headers in separate data models', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="settings"]').click();
  await expect(page.locator('#content').getByRole('heading', { name: 'Admin Settings', exact: true })).toBeVisible();
  await expect(page.locator('#companySettings')).toBeVisible();
  await expect(page.locator('#memberSettings')).toBeVisible();
  await expect(page.locator('#logoSettings')).toBeVisible();
  await expect(page.locator('#generalSettings')).toBeVisible();

  const originalMemberBanner = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).members.maya.banner, storageKey);
  await page.getByRole('button', { name: /Edit company branding/i }).click();
  await page.getByLabel('Company Name').fill('Hosis Architecture Studio');
  await page.getByLabel('Company Welcome Text').fill('Studio delivery, clearly managed.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  const saved = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), storageKey);
  expect(saved.workspace.companyHeader.name).toBe('Hosis Architecture Studio');
  expect(saved.workspace.companyHeader.welcome).toBe('Studio delivery, clearly managed.');
  expect(saved.members.maya.banner).toBe(originalMemberBanner);
});

test('admin can edit a member and open their aggregate personal workspace', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="members"]').click();
  await expect(page.locator('.members-table-row')).toHaveCount(8);
  const mayaRow = page.locator('.members-table-row').filter({ hasText: 'Maya Chen' });
  await expect(mayaRow).toContainText('maya@hosis.demo');
  await mayaRow.getByRole('button', { name: 'Edit Maya Chen' }).click();
  await page.getByLabel('Job Title').fill('Senior Architectural Coordinator');
  await page.getByLabel('Personal Welcome Text').fill('Lead today’s design priorities.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.locator('.member-identity').filter({ hasText: 'Maya Chen' }).click();
  await expect(page.locator('.member-personal-header')).toContainText('Welcome, Maya');
  await expect(page.locator('.member-personal-header')).toContainText('Senior Architectural Coordinator');
  await expect(page.getByRole('heading', { name: 'My Tasks Across All Projects', exact: true }).first()).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Projects', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Deadlines', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Meetings', exact: true })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'My Recent Activity', exact: true })).toBeVisible();
});

test('projects preserve multiple assigned members and member access is scoped', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="gallery"]').click();
  await page.locator('.project-card[data-project="hap-2601"]').click();
  await page.getByRole('button', { name: /Edit Project/i }).click();
  const assigned = page.locator('#editForm input[name="assigned"]');
  await expect(assigned).toHaveCount(8);
  await expect(assigned.nth(0)).toBeChecked();
  await assigned.nth(2).check();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  const projectMembers = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601').assigned, storageKey);
  expect(projectMembers.length).toBeGreaterThanOrEqual(3);

  await page.getByLabel('Switch role').click();
  await page.locator('#welcomeUser').selectOption('maya');
  await page.locator('#continueUser').click();
  await expect(page.locator('.member-personal-header')).toBeVisible();
  await expect(page.locator('[data-view="settings"]')).toHaveCount(0);
  await expect(page.getByRole('button', { name: /Edit my images/i })).toBeVisible();
});

test('team overview remains available beside the workspace accounting foundation', async ({ page }) => {
  await enterAdmin(page);
  await expect(page.locator('.team-overview-row')).toHaveCount(8);
  await expect(page.locator('.team-overview-head')).toContainText('Active Projects');
  await expect(page.locator('.team-overview-head')).toContainText('Open Tasks');
  await expect(page.locator('.team-overview-head')).toContainText('Overdue Tasks');
  await page.locator('[data-view="accounting"]').click();
  await expect(page.getByRole('heading', { name: 'Admin Accounting', exact: true })).toBeVisible();
  await expect(page.locator('.accounting-table tbody tr')).toHaveCount(12);
});
