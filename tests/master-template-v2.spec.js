const { test, expect } = require('@playwright/test');

const site = 'http://127.0.0.1:4173';

async function enter(page, user) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  if (user) {
    await page.locator('#welcomeUser').selectOption(user);
    await page.locator('#continueUser').click();
  } else {
    await page.getByRole('button', { name: 'Continue as Admin' }).click();
  }
}

async function openProject(page, id = 'hap-2601') {
  await page.locator('[data-view="gallery"]').click();
  await page.locator(`.project-card[data-project="${id}"]`).click();
}

test('admin can open a member workspace and members receive a different menu', async ({ page }) => {
  await enter(page);
  await expect(page.locator('.member-card')).toHaveCount(3);
  await page.locator('[data-member-filter="maya"]').first().click();
  await expect(page.locator('.page-heading h1')).toContainText('Maya Chen');
  await expect(page.locator('.dashboard-projects .project-card')).toHaveCount(3);
  await expect(page.locator('.open-task-list .dashboard-task')).toHaveCount(6);
  await page.locator('[data-view="members"]').click();
  await expect(page.locator('.member-profile-card')).toHaveCount(3);

  await page.getByLabel('Switch role').click();
  await page.locator('#welcomeUser').selectOption('liam');
  await page.locator('#continueUser').click();
  await expect(page.locator('[data-view="gallery"] span')).toHaveText('My Projects');
  await expect(page.locator('[data-view="schedule"] span')).toHaveText('My Schedule');
  await expect(page.locator('[data-view="meetings"] span')).toHaveText('My Meetings');
  await expect(page.locator('[data-view="members"]')).toBeHidden();
  await expect(page.locator('.dashboard-projects .project-card')).toHaveCount(3);
});

test('meeting action creates and updates the same project task', async ({ page }) => {
  await enter(page);
  await openProject(page);
  const meeting = page.locator('.meeting-card').first();
  await meeting.getByRole('button', { name: /Add task from meeting/i }).click();
  await page.getByLabel('Action / Task').fill('Confirm storefront hardware selection');
  await page.getByLabel('Assigned To').fill('Maya Chen');
  await page.getByLabel('Due Date').fill('2026-09-14');
  await page.getByLabel('Priority').selectOption('High');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.meeting-action').filter({ hasText: 'Confirm storefront hardware selection' })).toBeVisible();
  await expect(page.locator('.task-row').filter({ hasText: 'Confirm storefront hardware selection' })).toBeVisible();

  await page.locator('[data-view="gallery"]').click();
  await page.locator('[data-view="dashboard"]').click();
  const task = page.locator('.dashboard-task').filter({ hasText: 'Confirm storefront hardware selection' });
  await expect(task).toContainText('Sep 14, 2026');
  await expect(task).toHaveAttribute('data-priority', 'High');
});

test('construction administration uses separate addable registers', async ({ page }) => {
  await enter(page);
  await openProject(page);
  await page.locator('[data-stage="construction"]').click();
  await expect(page.locator('.register-card')).toHaveCount(12);
  await expect(page.locator('[data-register-group="specifications"]')).toContainText('Specifications');
  const rfi = page.locator('[data-register-group="rfis"]');
  await expect(rfi.locator('.register-row')).toHaveCount(2);
  await rfi.getByRole('button', { name: /Add RFI record/i }).click();
  await page.getByLabel('Record Number').fill('RFI-03');
  await page.getByLabel('Title / Subject').fill('Confirm ceiling access panel location');
  await page.getByLabel('Status').fill('Open');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('[data-register-group="rfis"] .register-row')).toHaveCount(3);
  await expect(page.locator('[data-register-group="rfis"]')).toContainText('Confirm ceiling access panel location');
});

test('tender workspace tracks bidders, separate prices, winner and post-tender phase', async ({ page }) => {
  await enter(page);
  await openProject(page);
  await page.locator('[data-stage="tender"]').click();
  await expect(page.locator('.bid-table tbody tr')).toHaveCount(3);
  await expect(page.locator('.winner-badge')).toHaveText(/Recommended/);
  await expect(page.locator('.separate-prices').first()).toContainText('SP-01');

  await page.getByRole('button', { name: /Tender setup/i }).click();
  await page.getByLabel('Current Phase').selectOption('Post-Tender');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.tender-phase')).toContainText('Post-Tender');

  await page.getByRole('button', { name: /Add bidder/i }).click();
  await page.getByLabel('Bidder / Contractor').fill('Northstar Construction');
  await page.getByLabel('Base Bid (CAD)').fill('281500');
  await page.getByLabel('Separate Prices').fill('SP-01 Millwork: $9,500');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.bid-table tbody tr')).toHaveCount(4);
  await expect(page.locator('.bid-table')).toContainText('Northstar Construction');
});

test('new workspaces remain within mobile viewport', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 844 });
  await enter(page);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await openProject(page);
  await page.locator('[data-stage="construction"]').click();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
