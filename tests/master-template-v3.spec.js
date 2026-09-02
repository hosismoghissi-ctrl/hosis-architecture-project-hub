const { test, expect } = require('@playwright/test');

const site = 'http://127.0.0.1:4173';
const storageKey = 'hosisHubPrototypeV1';

async function enterAdmin(page) {
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
}

async function openProject(page, id) {
  await page.locator('[data-view="gallery"]').click();
  await page.locator(`.project-card[data-project="${id}"]`).click();
}

test('expanded simulation includes eight members and twelve projects', async ({ page }) => {
  await enterAdmin(page);
  await expect(page.locator('.member-card')).toHaveCount(8);
  await expect(page.locator('.dashboard-projects .project-card')).toHaveCount(12);
  await page.locator('[data-view="members"]').click();
  await expect(page.locator('.member-profile-card')).toHaveCount(8);
});

test('admin edits the shared header and changes menu order with accessible controls', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="settings"]').click();
  await page.getByRole('button', { name: 'Edit workspace header' }).click();
  await page.getByLabel('Dashboard Heading').fill('Projects, people and delivery in one view.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.brand-preview')).toContainText('Projects, people and delivery in one view.');

  await page.getByRole('button', { name: 'Move Projects up' }).click();
  const order = await page.locator('.main-nav[aria-label="Primary"] [data-menu-key]').evaluateAll(items => items.map(item => item.dataset.menuKey));
  expect(order.slice(0, 2)).toEqual(['gallery', 'dashboard']);
  await expect(page.locator('[data-menu-key="gallery"]')).toHaveAttribute('draggable', 'true');
});

test('permit workspace tracks discipline packages and repeated comment responses', async ({ page }) => {
  await enterAdmin(page);
  await openProject(page, 'hap-2609');
  await page.locator('[data-stage="permit"]').click();
  await expect(page.locator('.permit-discipline')).toHaveCount(4);
  await expect(page.locator('.permit-cycle')).toHaveCount(1);
  await expect(page.locator('.permit-comment')).toHaveCount(3);

  await page.getByRole('button', { name: /Add city comment & response/i }).click();
  await page.getByLabel('Comment Number').fill('S-02');
  await page.getByLabel('Discipline').selectOption('structural');
  await page.getByLabel('City Comment / Question').fill('Provide lintel design at the new opening.');
  await page.getByLabel('Architect / Consultant Response').fill('Structural sketch SK-02 added to the resubmission.');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.permit-comment')).toHaveCount(4);
  await expect(page.locator('.permit-cycle')).toContainText('Structural sketch SK-02');

  await page.getByRole('button', { name: /Add review cycle/i }).click();
  await page.getByLabel('Cycle Name / Number').fill('Cycle 02');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.permit-cycle')).toHaveCount(2);
});

test('admin controls schedule dates and project row order', async ({ page }) => {
  await enterAdmin(page);
  await page.locator('[data-view="schedule"]').click();
  await expect(page.locator('.timeline-row')).toHaveCount(12);
  await expect(page.locator('.timeline-bar.schedule-draggable').first()).toHaveAttribute('draggable', 'true');
  const before = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601').schedule[0].start, storageKey);
  await page.locator('[data-shift-project="hap-2601"][data-days="7"]').click();
  const after = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects.find(p => p.id === 'hap-2601').schedule[0].start, storageKey);
  expect(new Date(after) - new Date(before)).toBe(7 * 86400000);
});

test('professional tender comparison keeps pricing categories separate', async ({ page }) => {
  await enterAdmin(page);
  await openProject(page, 'hap-2608');
  await page.locator('[data-stage="tender"]').click();
  await expect(page.locator('.bid-table')).toContainText('Separate / Alternate Prices');
  await expect(page.locator('.bid-table')).toContainText('Allowances / Unit Prices');
  await expect(page.locator('.post-tender-head')).toContainText('Tender RFIs');
  await page.getByRole('button', { name: /Add bidder/i }).click();
  await expect(page.getByLabel('Cash Allowances (CAD)')).toBeVisible();
  await expect(page.getByLabel('Construction Duration (weeks)')).toBeVisible();
});
