const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';
const key = 'hosisHubPrototypeV1';
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
async function admin(page) {
  await page.goto(site);
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
}
async function state(page) { return page.evaluate(k => JSON.parse(localStorage.getItem(k)), key); }
test('all admin routes render without runtime errors and demo records survive', async ({ page }) => {
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await admin(page); const before = await state(page);
  for (const route of ['gallery', 'schedule', 'tasks', 'members', 'clients', 'consultants', 'contractors', 'accounting', 'files', 'settings', 'dashboard']) {
    await page.locator(`[data-view="${route}"]`).click();
    await expect(page.locator('#content')).not.toBeEmpty();
  }
  expect(errors).toEqual([]);
  const after = await state(page);
  expect(after.projects).toHaveLength(12); expect(Object.keys(after.members)).toHaveLength(8);
  expect(after.projects).toEqual(before.projects);
  await expect(page.locator('.team-overview-row')).toHaveCount(8);
  const overlaps=await page.locator('.dashboard-projects .project-card').evaluateAll(cards=>cards.some(card=>card.querySelector('.card-top').getBoundingClientRect().bottom>card.querySelector('.card-bottom').getBoundingClientRect().top));
  expect(overlaps).toBe(false);
});
test('task filters combine project, member, client, status, priority and due dates', async ({ page }) => {
  await admin(page); const s = await state(page), p = s.projects[0];
  await page.locator('[data-view="tasks"]').click();
  await page.locator('[data-task-filter="project"]').selectOption(p.id);
  await page.locator('[data-task-filter="member"]').selectOption(p.assigned[0]);
  await page.locator('[data-task-filter="client"]').selectOption(p.client);
  await page.locator('[data-task-filter="status"]').selectOption('Open');
  await page.locator('[data-task-filter="priority"]').selectOption('High');
  const expected = p.tasks.filter(t => !t[4] && t[3] === 'High');
  await expect(page.locator('[data-dashboard-task]')).toHaveCount(expected.length);
  const ids = await page.locator('[data-task-project]').evaluateAll(items => items.map(item => item.dataset.taskProject));
  expect(ids.every(id => id === p.id)).toBe(true);
  await page.locator('[data-task-filter="dateFrom"]').fill('2099-01-01');
  await page.locator('[data-task-filter="dateFrom"]').press('Tab');
  await expect(page.locator('[data-dashboard-task]')).toHaveCount(0);
  await page.locator('[data-clear-task]').click();
  await expect(page.locator('[data-dashboard-task]').first()).toBeVisible();
});
test('Files is independent and uploads persist, download and remain project linked', async ({ page }) => {
  await admin(page);
  await page.locator('[data-view="files"]').click();
  await expect(page.getByRole('heading', { name: 'Document Library' })).toBeVisible();
  await page.locator('[data-open-file]').first().click();
  await expect(page.locator('#editModal')).toBeVisible();
  await expect(page.locator('.project-hero')).toHaveCount(0);
  await page.keyboard.press('Escape');
  await page.locator('[data-upload-document]').click();
  await page.locator('[data-document-attachment]').setInputFiles({ name: 'Coordination-note.txt', mimeType: 'text/plain', buffer: Buffer.from('Hosis local attachment verification') });
  await expect(page.locator('[data-upload-status]')).toContainText('ready to save');
  await page.locator('#editForm [name="category"]').selectOption('Meeting Minutes');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.getByRole('heading', { name: 'Document Library' })).toBeVisible();
  await page.reload(); await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await page.locator('[data-view="files"]').click();
  await page.locator('[data-file-filter="query"]').fill('Coordination-note');
  await page.locator('[data-file-filter="query"]').press('Tab');
  await expect(page.locator('.file-table tbody tr')).toHaveCount(1);
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Coordination-note.txt' }).click();
  expect((await downloadPromise).suggestedFilename()).toBe('Coordination-note.txt');
  await page.locator('.file-table [data-project]').click();
  await expect(page.locator('.project-hero')).toBeVisible();
});
test('company logo uploads, reuses throughout entry and dashboard, and removes', async ({ page }) => {
  await admin(page); const before = await state(page);
  await page.locator('[data-view="settings"]').click();
  await page.getByRole('button', { name: 'Edit company branding' }).click();
  await page.locator('[data-logo-upload]').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.logo-upload-control small')).toContainText('ready');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.brand-mark img')).toHaveAttribute('src', /^data:image\/png/);
  await page.locator('[data-view="dashboard"]').click();
  await expect(page.locator('.company-hero-logo img')).toHaveAttribute('src', /^data:image\/png/);
  await page.getByLabel('Switch role').click();
  await expect(page.locator('.cinematic-company-logo')).toBeVisible();
  await expect(page.locator('.entry-company-logo')).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await page.locator('[data-view="settings"]').click();
  await page.getByRole('button', { name: 'Edit company branding' }).click();
  await page.locator('[data-remove-logo]').click();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.brand-mark img')).toHaveCount(0);
  expect((await state(page)).members).toEqual(before.members);
});
test('consultant profile edits preserve contacts and company logo on project', async ({ page }) => {
  await admin(page); await page.locator('[data-view="consultants"]').click();
  await page.locator('[data-company]').first().click();
  await expect(page.locator('.company-profile-details')).toContainText('Website');
  await page.getByRole('button', { name: 'Edit Company Profile' }).click();
  await page.getByLabel('Website', { exact: true }).fill('https://example.com/studio');
  await page.locator('[data-logo-upload]').setInputFiles({ name: 'logo.png', mimeType: 'image/png', buffer: png });
  await expect(page.locator('.logo-upload-control small')).toContainText('ready');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.company-profile-details')).toContainText('https://example.com/studio');
  await expect(page.locator('.company-profile-header .company-logo img')).toHaveAttribute('src', /^data:image\/png/);
  await page.locator('.project-grid [data-project]').first().click();
  await expect(page.locator('.project-internal-members')).toBeVisible();
  await expect(page.locator('[data-project-section="companies"] .company-logo img').first()).toBeVisible();
});
test('member navigation, files and linked company profiles exclude unassigned projects', async ({ page }) => {
  await admin(page); const s = await state(page);
  await page.getByLabel('Switch role').click(); await page.locator('#welcomeUser').selectOption('maya'); await page.locator('#continueUser').click();
  await expect(page.locator('[data-view="settings"]')).toHaveCount(0);
  for (const route of ['gallery', 'tasks', 'schedule', 'meetings', 'expenses', 'files', 'dashboard']) {
    await page.locator(`[data-view="${route}"]`).click(); await expect(page.locator('#content')).not.toBeEmpty();
  }
  await page.locator('[data-view="files"]').click();
  await expect(page.locator('[data-upload-document]')).toHaveCount(0);
  const ids = await page.locator('.file-table [data-project]').evaluateAll(items => items.map(item => item.dataset.project));
  expect(ids.every(id => s.projects.find(p => p.id === id).assigned.includes('maya'))).toBe(true);
  await page.locator('.file-table [data-project]').first().click();
  await page.locator('[data-company-profile]').first().click();
  await expect(page.locator('.company-profile-header')).toBeVisible();
  const related = await page.locator('.project-grid [data-project]').evaluateAll(items => items.map(item => item.dataset.project));
  expect(related.every(id => s.projects.find(p => p.id === id).assigned.includes('maya'))).toBe(true);
});
test('Files and Tasks fit phone and desktop and contain no page errors', async ({ page }) => {
  const errors=[];page.on('pageerror', e => errors.push(e.message));await admin(page);
  for(const width of [390,768,1440]){await page.setViewportSize({width,height:950});for(const route of ['tasks','files']){if(width<900)await page.locator('#menuToggle').click();await page.locator(`[data-view="${route}"]`).click();expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1)).toBe(true);}}
  expect(errors).toEqual([]);
});
test('reset preserves working clients, companies and workspace settings',async({page})=>{
  await admin(page);await page.locator('[data-view="settings"]').click();
  page.once('dialog',d=>d.accept());await page.locator('[data-reset-demo]').click();
  await expect(page.locator('.team-overview-row')).toHaveCount(8);
  await page.locator('[data-view="clients"]').click();await expect(page.locator('.directory-card')).toHaveCount(12);
  await page.locator('[data-view="settings"]').click();await expect(page.locator('#companySettings')).toBeVisible();
});
