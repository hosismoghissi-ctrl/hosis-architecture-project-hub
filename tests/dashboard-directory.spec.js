const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';
const key = 'hosisHubPrototypeV1';
async function enter(page, user) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  if (user) {
    await page.locator('#welcomeUser').selectOption(user);
    await page.locator('#continueUser').click();
  } else await page.getByRole('button', { name: 'Continue as Admin' }).click();
}

test('dashboard puts prioritized project tasks before Project Schedule and preserves task edits', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await enter(page);
  await expect(page.getByRole('heading', { name: 'Recent Activity', exact: true })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Portfolio Schedule', exact: true })).toHaveCount(0);
  const ordering = await page.locator('#content').evaluate(el => {
    const task = el.querySelector('.dashboard-tasks');
    return !!(task.compareDocumentPosition(el.querySelector('.dashboard-schedule')) & Node.DOCUMENT_POSITION_FOLLOWING);
  });
  expect(ordering).toBe(true);
  await expect(page.locator('.open-task-list .dashboard-task')).toHaveCount(25);
  const priorities = await page.locator('.open-task-list .dashboard-task').evaluateAll(rows => rows.map(r => r.dataset.priority));
  expect(priorities).toEqual([...priorities].sort((a, b) => ['High', 'Medium', 'Low'].indexOf(a) - ['High', 'Medium', 'Low'].indexOf(b)));
  await expect(page.locator('.open-task-list .dashboard-task').first()).toContainText('Close mechanical ceiling comments');
  const before = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects[0], key);
  await page.locator('[data-dashboard-task="t102"]').click();
  await expect(page.locator('.completed-tasks [data-dashboard-task="t102"]')).toHaveAttribute('aria-pressed', 'true');
  await page.locator('[data-view="gallery"]').click();
  await page.locator('.project-card[data-project="hap-2601"]').click();
  await expect(page.locator('[data-task="t102"]')).toHaveAttribute('aria-pressed', 'true');
  await enter(page);
  await expect(page.locator('.completed-tasks [data-dashboard-task="t102"]')).toHaveAttribute('aria-pressed', 'true');
  const after = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects[0], key);
  expect(after.notes).toBe(before.notes);
  expect(after.schedule).toEqual(before.schedule);
  expect(after.companies).toEqual(before.companies);
  expect(after.activity).toEqual(before.activity);
  await page.locator('.completed-tasks summary').click();
  await page.locator('[data-dashboard-task="t102"]').click();
  await expect(page.locator('.open-task-list [data-dashboard-task="t102"]')).toHaveAttribute('aria-pressed', 'false');
  await page.setViewportSize({ width: 1440, height: 1100 });
  await page.screenshot({ path: 'test-results/dashboard-tasks-schedule.png', fullPage: true });
  expect(errors).toEqual([]);
});

test('directory groups repeated companies, retains project-specific contacts and opens related projects', async ({ page }) => {
  await enter(page);
  await page.evaluate(k => {
    const data = JSON.parse(localStorage.getItem(k));
    data.projects[0].companies.find(c => c.name === 'Aeroform Mechanical Studio').email = 'workplace@example.com';
    data.projects[4].companies.find(c => c.name === 'Aeroform Mechanical Studio').email = 'residences@example.com';
    localStorage.setItem(k, JSON.stringify(data));
  }, key);
  await enter(page);
  for (const type of ['clients', 'consultants', 'contractors']) {
    await page.locator(`[data-view="${type}"]`).click();
    await expect(page.locator('.directory-card').first()).toBeVisible();
    await expect(page.locator(`[data-view="${type}"]`)).toHaveClass(/active/);
  }
  await expect(page.locator('.directory-card')).toHaveCount(4);
  await expect(page.getByText('To Be Determined', { exact: true })).toHaveCount(0);
  await page.locator('[data-view="consultants"]').click();
  const firm = page.locator('.directory-card').filter({ hasText: 'Aeroform Mechanical Studio' });
  await expect(firm).toHaveCount(1);
  await expect(firm.locator('[data-project]')).toHaveCount(3);
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.screenshot({ path: 'test-results/consultants-directory.png', fullPage: true });
  await firm.getByRole('button', { name: 'View company & contacts' }).click();
  await expect(page.locator('.company-profile-header h2')).toHaveText('Aeroform Mechanical Studio');
  await expect(page.getByRole('link', { name: 'workplace@example.com' })).toHaveAttribute('href', 'mailto:workplace%40example.com');
  await expect(page.getByRole('link', { name: 'residences@example.com' })).toBeVisible();
  await expect(page.locator('.project-card')).toHaveCount(3);
  await page.screenshot({ path: 'test-results/company-profile.png', fullPage: true });
  await page.locator('.project-card[data-project="hap-2605"]').click();
  await expect(page.locator('.project-hero h1')).toHaveText('Harbourstone Residences');
});

test('assigned-user tasks include only assigned projects and admin directories are hidden', async ({ page }) => {
  await enter(page, 'sofia');
  await expect(page.locator('.open-task-list .dashboard-task')).toHaveCount(10);
  await expect(page.locator('.dashboard-tasks')).not.toContainText('Charles Studio Workplace');
  await expect(page.locator('[data-view="clients"]')).toBeHidden();
  await expect(page.locator('[data-view="consultants"]')).toBeHidden();
  await expect(page.locator('[data-view="contractors"]')).toBeHidden();
  await expect(page.locator('[data-view="members"]')).toBeHidden();
  await expect(page.locator('[data-view="gallery"] span')).toHaveText('My Projects');
});

test('company edits and deletions in project records are reflected in the directory without resetting data', async ({ page }) => {
  await enter(page);
  await page.locator('[data-view="clients"]').click();
  await page.locator('.directory-card').filter({ hasText: 'Northline Workplace Group' }).locator('[data-project]').click();
  const company = page.locator('.company-card').filter({ hasText: 'Northline Workplace Group' });
  await company.locator('[data-edit]').click();
  await page.getByLabel('Contact Person', { exact: true }).fill('Updated Client Contact');
  await page.getByLabel('Email', { exact: true }).fill('client@example.com');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await page.locator('[data-view="clients"]').click();
  await page.locator('.directory-card').filter({ hasText: 'Northline Workplace Group' }).locator('[data-company]').click();
  await expect(page.getByRole('heading', { name: 'Updated Client Contact' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'client@example.com' })).toBeVisible();
  await page.locator('.project-card').click();
  page.once('dialog', dialog => dialog.accept());
  await page.locator('.company-card').filter({ hasText: 'Northline Workplace Group' }).locator('[data-delete]').click();
  await page.locator('[data-view="clients"]').click();
  await expect(page.locator('.directory-card')).toHaveCount(11);
  await expect(page.locator('#content')).not.toContainText('Northline Workplace Group');
});

test('dashboard and bottom directory navigation work on mobile without horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await enter(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await page.locator('[data-view="clients"]').click();
  await expect(page.locator('.directory-card')).toHaveCount(12);
  await expect(page.locator('#sidebar')).not.toHaveClass(/open/);
  await page.locator('.directory-card').first().locator('[data-company]').click();
  await expect(page.locator('.company-profile-header')).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.screenshot({ path: 'test-results/company-mobile.png', fullPage: true });
});
