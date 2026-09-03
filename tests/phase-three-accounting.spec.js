const { test, expect } = require('@playwright/test');

const site = 'http://127.0.0.1:4173';
const storageKey = 'hosisHubPrototypeV1';

async function enterAdmin(page) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ENTER WORKSPACE' }).click();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
}

async function enterMember(page, id = 'maya') {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'ENTER WORKSPACE' }).click();
  await page.locator('#welcomeUser').selectOption(id);
  await page.locator('#continueUser').click();
}

test('every project has accounting totals and a complete expense editor', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="gallery"]').click();
  await page.locator('[data-project="hap-2601"]').first().click();
  await expect(page.getByRole('heading', { name: 'Accounting & Expenses', exact: true })).toBeVisible();
  await expect(page.locator('[data-project-section="accounting"] .expense-metrics')).toContainText('Project Expense Total');
  await page.getByRole('button', { name: 'Add expense', exact: true }).click();
  await expect(page.locator('#editForm input[name="description"]')).toBeVisible();
  await expect(page.locator('#editForm input[name="invoiceNumber"]')).toBeVisible();
  await expect(page.locator('#editForm input[name="receipt"]')).toBeVisible();
  await expect(page.locator('#editForm select[name="reimbursementStatus"]')).toBeVisible();
});

test('member submission feeds member, project and admin accounting from one record', async ({ page }) => {
  await enterMember(page, 'maya');
  await page.locator('[data-view="expenses"]').click();
  await page.getByRole('button', { name: 'Submit Expense', exact: true }).click();
  await page.locator('#editForm select[name="projectId"]').selectOption('hap-2601');
  await page.locator('#editForm select[name="type"]').selectOption('Taxi / Uber');
  await page.locator('#editForm input[name="description"]').fill('Airport coordination meeting ride');
  await page.locator('#editForm input[name="amount"]').fill('73.25');
  await page.locator('#editForm input[name="invoiceNumber"]').fill('UBER-TEST-73');
  await page.locator('#editForm input[name="vendor"]').fill('Uber');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.member-expense-list')).toContainText('Airport coordination meeting ride');
  const stored = await page.evaluate(k => JSON.parse(localStorage.getItem(k)), storageKey);
  const saved = stored.projects.find(p => p.id === 'hap-2601').expenses.find(e => e.invoiceNumber === 'UBER-TEST-73');
  expect(saved.paidBy).toBe('maya');
  expect(saved.workspaceId).toBe(stored.activeWorkspaceId);
  expect(saved.amount).toBe(73.25);

  await page.getByLabel('Switch role').click();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await page.locator('[data-view="accounting"]').click();
  await expect(page.locator('.accounting-table')).toContainText('UBER-TEST-73');
  await expect(page.locator('.accounting-table')).toContainText('Maya Chen');
  await page.locator('[data-accounting-filter="member"]').selectOption('maya');
  await expect(page.locator('.accounting-table')).toContainText('Airport coordination meeting ride');
});

test('admin accounting filters and totals aggregate active and archived projects', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="accounting"]').click();
  await expect(page.locator('.expense-metrics')).toContainText('Pending Reimbursement');
  await expect(page.locator('.accounting-table tbody tr')).toHaveCount(12);
  await page.locator('[data-accounting-filter="type"]').selectOption('Permit Fee');
  await expect(page.locator('.accounting-table tbody tr')).toHaveCount(3);
  await page.getByRole('button', { name: /Clear filters/i }).click();
  await expect(page.locator('.accounting-table tbody tr')).toHaveCount(12);
});
