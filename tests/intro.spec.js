const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';

test('live globe reaches Toronto and the welcome screen', async ({ page }) => {
  test.setTimeout(90000);
  const errors = [];
  page.on('pageerror', error => { errors.push(error.message); console.log('Intro runtime error:', error.stack); });
  page.on('console', message => { if (['warning', 'error'].includes(message.type())) console.log('Intro browser:', message.text()); });
  page.on('requestfailed', request => { if (request.failure()?.errorText !== 'net::ERR_ABORTED') console.log('Intro request failed:', request.url(), request.failure()?.errorText); });
  await page.goto(site);
  await expect(page.locator('.cinematic')).toHaveClass(/map-ready/, { timeout: 25000 });
  // Exercise Pause at the beginning, not beside the end-of-animation unmount.
  await page.getByRole('button', { name: 'Pause intro' }).click({ timeout: 5000 });
  await expect(page.getByRole('button', { name: 'Resume intro' })).toBeVisible();
  await page.screenshot({ path: 'test-results/intro-startup.png' });
  await page.getByRole('button', { name: 'Resume intro' }).click();
  await expect(page.locator('.cinematic')).toHaveAttribute('data-stage', '2', { timeout: 30000 });
  await page.screenshot({ path: 'test-results/toronto-intro.png' });
  try {
    await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible({ timeout: 45000 });
  } finally {
    await page.screenshot({ path: 'test-results/intro-final-state.png' });
  }
  await expect(page.getByText('The live map is unavailable. You can still enter the hub.')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/hosis-welcome.png' });
  expect(errors).toEqual([]);
});

test('skip works before map loads, preserves roles, and replay opens intro', async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto(site);
  await page.getByRole('button', { name: /Skip Intro/i }).click();
  await expect(page.getByRole('button', { name: 'Continue as Admin' })).toBeVisible();
  await page.getByRole('button', { name: /Replay Intro/i }).click();
  await expect(page.getByRole('button', { name: /Skip Intro/i })).toBeVisible();
});

test('completed session goes straight to existing role selection', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hosis-cinematic-seen-v1', '1'));
  await page.goto(site);
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#intro')).toBeHidden();
});

test('reduced motion uses static welcome and does not request map data', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', request => { if (request.url().includes('tiles.openfreemap.org')) requests.push(request.url()); });
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible();
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Enter Project Hub' }).click();
  await expect(page.locator('#welcome')).toBeVisible();
});

test('map failure offers entry without blocking the user', async ({ page }) => {
  await page.route('https://tiles.openfreemap.org/**', route => route.abort());
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible({ timeout: 18000 });
  await expect(page.getByText('The live map is unavailable. You can still enter the hub.')).toBeVisible();
});

test('mobile intro has no horizontal overflow', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible();
  const width = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
  expect(width[0]).toBeLessThanOrEqual(width[1]);
});
