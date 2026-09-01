const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';
const key = 'hosisHubPrototypeV1';

async function openProject(page, user = false) {
  await page.addInitScript(() => sessionStorage.setItem('hosis-video-annotated-seen-v1', '1'));
  await page.goto(site, { waitUntil: 'domcontentloaded' });
  if (user) await page.locator('#continueUser').click();
  else await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await page.locator('[data-view="gallery"]').click();
  await page.locator('.project-card').first().click();
  await expect(page.locator('.stage-chip').first()).toHaveAttribute('data-stage', 'survey');
  await page.locator('[data-stage="design"]').click();
}

test('each scoped stage has an editable checklist and progress excludes N/A', async ({ page }) => {
  await openProject(page);
  await expect(page.locator('.stage-tabs')).toHaveCount(0);
  await expect(page.locator('.stage-chip')).toHaveCount(6);
  await expect(page.locator('.workflow-row')).toHaveCount(15);
  await expect(page.locator('.workflow-count')).toHaveText('0/15 milestones complete');
  const first = page.locator('.milestone-status').first();
  await first.selectOption('Complete');
  await expect(page.locator('.workflow-count')).toHaveText('1/15 milestones complete');
  await page.getByLabel('Status: Site plan').selectOption('N/A');
  await expect(page.locator('.workflow-count')).toHaveText('1/14 milestones complete');
  await expect(page.locator('.workflow-progress')).toHaveAttribute('aria-valuenow', '7');
  await expect(page.locator('[data-stage="design"] small')).toHaveText('7% complete');
  for (const stage of ['survey', 'permit', 'closeout']) {
    await page.locator(`[data-stage="${stage}"]`).click();
    await expect(page.locator('.milestone-status').first()).toBeVisible();
    await page.locator('.milestone-status').first().selectOption('In progress');
  }
  await page.locator('[data-stage="tender"]').click();
  await expect(page.locator('.bid-table')).toBeVisible();
  await page.locator('[data-stage="construction"]').click();
  await expect(page.locator('.register-card')).toHaveCount(12);
  await page.locator('[data-stage="design"]').click();
  await expect(first).toHaveValue('Complete');
  await page.getByRole('button', { name: 'Add custom milestone' }).click();
  await page.getByLabel('Milestone Name', { exact: true }).fill('Review custom glazing details');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('.workflow-row')).toHaveCount(16);
  const custom = page.locator('.workflow-row').filter({ hasText: 'Review custom glazing details' });
  await custom.locator('[data-edit]').click();
  await page.getByLabel('Optional milestone').check();
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(custom.locator('.optional-tag')).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await custom.locator('[data-delete]').click();
  await expect(custom).toHaveCount(0);
  await openProject(page);
  await expect(page.locator('.workflow-count')).toHaveText('1/14 milestones complete');
  await expect(page.getByLabel('Status: Site plan')).toHaveValue('N/A');
});

test('project notes, team contacts and company records persist with safe logo handling', async ({ page }) => {
  await openProject(page);
  await expect(page.locator('aside.detail-stack .panel h3')).toHaveText(['Project Notes', 'Project Tasks']);
  await expect(page.locator('.project-layout').getByRole('heading', { name: /^(Documents|Upcoming Deadlines|Recent Activity)$/ })).toHaveCount(0);
  await page.getByLabel('Project Notes', { exact: true }).fill('Keep survey access notes here.');
  // Save on input, without relying on blur before navigation or reload.
  expect(await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects[0].notes, key)).toBe('Keep survey access notes here.');
  const team = page.locator('.team-card').first();
  await team.locator('[data-edit]').click();
  await page.getByLabel('Email', { exact: true }).fill('elena@example.com');
  await page.getByLabel('Phone', { exact: true }).fill('+1 416 555 0101');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(team.getByRole('link', { name: 'elena@example.com' })).toHaveAttribute('href', 'mailto:elena%40example.com');
  await page.getByRole('button', { name: 'Add company', exact: true }).click();
  await page.getByLabel('Company Name', { exact: true }).fill('Example Survey Studio');
  await page.getByLabel('Logo Image URL').fill('javascript:alert(1)');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  await expect(page.locator('#editModal')).toBeVisible();
  await page.getByLabel('Logo Image URL').fill('');
  await page.getByRole('button', { name: 'Save Changes' }).click();
  const company = page.locator('.company-card').filter({ hasText: 'Example Survey Studio' });
  await expect(company.locator('.company-logo')).toBeVisible();
  await openProject(page);
  await expect(page.getByLabel('Project Notes', { exact: true })).toHaveValue('Keep survey access notes here.');
  await expect(team.getByRole('link', { name: '+1 416 555 0101' })).toHaveAttribute('href', 'tel:+14165550101');
  await expect(company).toBeVisible();
  page.once('dialog', dialog => dialog.accept());
  await company.locator('[data-delete]').click();
  await expect(company).toHaveCount(0);
});

test('legacy administration and user edits survive migration and repeated reloads', async ({ page }) => {
  await openProject(page);
  await page.evaluate(k => {
    const data = JSON.parse(localStorage.getItem(k)), p = data.projects[0];
    p.scope = ['design', 'admin', 'permit'];
    p.schedule = [{ id: 'legacy-schedule', stage: 'admin', start: '2026-01-01', end: '2026-12-01', status: 'Ongoing' }];
    p.stageItems.design = [{ id: 'custom-old', title: 'Previously saved drawing', detail: 'Do not overwrite', status: 'Issued', date: '2026-07-21' }];
    p.stageItems.admin = [{ id: 'minutes', title: 'Existing meeting minutes', status: 'Current' }];
    p.notes = 'Original project note';
    p.team[0].email = 'preserve@example.com';
    delete p.legacyAdministration; delete p.workflowVersion;
    delete p.stageItems.survey; delete p.companies;
    localStorage.setItem(k, JSON.stringify(data));
  }, key);
  await openProject(page);
  await expect(page.locator('[data-stage="admin"]')).toHaveCount(0);
  await expect(page.locator('[data-stage="survey"]')).toBeVisible();
  await expect(page.getByText('Previously saved drawing', { exact: true })).toBeVisible();
  await expect(page.getByLabel('Status: Previously saved drawing')).toHaveValue('Complete');
  await page.locator('[data-stage="survey"]').click();
  await expect(page.getByText('Existing meeting minutes', { exact: true })).toHaveCount(0);
  const migrated = await page.evaluate(k => JSON.parse(localStorage.getItem(k)).projects[0], key);
  expect(migrated.legacyAdministration.stageItems[0].id).toBe('minutes');
  expect(migrated.legacyAdministration.schedule[0].id).toBe('legacy-schedule');
  expect(migrated.documents).toHaveLength(3);
  expect(migrated.activity).toHaveLength(3);
  expect(migrated.deadlines).toHaveLength(3);
  expect(migrated.notes).toBe('Original project note');
  expect(migrated.team[0].email).toBe('preserve@example.com');
  await openProject(page);
  await expect(page.locator('.workflow-row')).toHaveCount(16);
});

test('assigned user cannot edit milestones, registers, contacts or project notes', async ({ page }) => {
  await openProject(page, true);
  await expect(page.locator('[data-milestone-status], [data-add], [data-edit], [data-delete]')).toHaveCount(0);
  await expect(page.getByLabel('Project Notes', { exact: true })).toHaveAttribute('readonly', '');
  await expect(page.locator('.milestone-status.read-only')).toHaveCount(15);
});

test('project layout and checklist fit phone, tablet and desktop', async ({ page }) => {
  await openProject(page);
  for (const width of [375, 844, 1024, 1440]) {
    await page.setViewportSize({ width, height: width === 844 ? 390 : 960 });
    const size = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(size[0], `overflow at ${width}px`).toBeLessThanOrEqual(size[1]);
    await page.locator('.workflow-list').scrollIntoViewIfNeeded();
    await expect(page.locator('.milestone-status').first()).toBeVisible();
  }
  await page.screenshot({ path: 'test-results/project-desktop.png', fullPage: true });
  await page.locator('#stageContent').screenshot({ path: 'test-results/project-workflow.png' });
  await page.locator('.company-grid').screenshot({ path: 'test-results/project-companies.png' });
  await page.setViewportSize({ width: 375, height: 844 });
  await page.screenshot({ path: 'test-results/project-mobile.png', fullPage: true });
});

test('saved scopes and schedules put Site Survey first without changing dates or records', async ({ page }) => {
  await openProject(page);
  const before = await page.evaluate(k => {
    const data = JSON.parse(localStorage.getItem(k));
    const project = data.projects[0];
    project.scope.reverse(); project.schedule.reverse();
    project.schedule.find(s => s.stage === 'design').start = '2025-12-03';
    localStorage.setItem(k, JSON.stringify(data));
    return { schedule: [...project.schedule].sort((a, b) => a.id.localeCompare(b.id)), items: project.stageItems, notes: project.notes };
  }, key);
  await openProject(page);
  await expect(page.locator('.stage-chip').nth(1)).toHaveAttribute('data-stage', 'design');
  await expect(page.locator('.project-schedule-row').first()).toContainText('Site Survey');
  const after = await page.evaluate(k => {
    const project = JSON.parse(localStorage.getItem(k)).projects[0];
    return { schedule: [...project.schedule].sort((a, b) => a.id.localeCompare(b.id)), items: project.stageItems, notes: project.notes };
  }, key);
  expect(after).toEqual(before);
  await page.getByRole('button', { name: 'Edit Scope' }).first().click();
  await expect(page.locator('#scopeOptions input').first()).toHaveValue('survey');
});
