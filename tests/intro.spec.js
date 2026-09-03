const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';

async function enterIntro(page) {
  await page.getByRole('button', { name: 'ENTER WORKSPACE' }).click();
  await expect(page.locator('#welcome')).toBeVisible();
}

test('cinematic architecture intro is separate from the existing role entry', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(site);

  await expect(page.getByRole('heading', { name: 'HOSIS ARCHITECTURE' })).toBeVisible();
  await expect(page.getByText('PROJECT DELIVERY & COORDINATION', { exact: true })).toBeVisible();
  await expect(page.locator('.cinematic-sketch')).toHaveAttribute('src', /assets\/hosis-intro-sketch\.jpg$/);
  await expect(page.locator('.cinematic-render')).toHaveAttribute('src', /assets\/hosis-intro-render\.jpg$/);
  await expect(page.getByRole('button', { name: 'Continue as Admin' })).toBeHidden();
  await expect(page.getByText(/Cyber Ronin|Neural Edges|RONIN-X/i)).toHaveCount(0);

  const intro = page.locator('.cinematic');
  const before = await intro.evaluate(element => element.style.getPropertyValue('--reveal-x'));
  await page.mouse.move(920, 420);
  await expect(intro).toHaveClass(/has-interacted/);
  const after = await intro.evaluate(element => element.style.getPropertyValue('--reveal-x'));
  expect(after).not.toBe(before);

  await enterIntro(page);
  await expect(page.locator('#welcomeTitle')).toBeFocused();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#intro')).toBeHidden();
  expect(errors).toEqual([]);
});

test('touch input updates the architectural reveal', async ({ page }) => {
  await page.goto(site);
  const intro = page.locator('.cinematic');
  await intro.dispatchEvent('pointerdown', { clientX: 180, clientY: 280, pointerType: 'touch' });
  await expect(intro).toHaveClass(/has-interacted/);
  const x = await intro.evaluate(element => element.style.getPropertyValue('--reveal-x'));
  expect(parseFloat(x)).toBeGreaterThan(0);
});

test('switch role returns to login without replaying the presentation layer', async ({ page }) => {
  await page.goto(site);
  await enterIntro(page);
  await page.locator('#welcomeUser').selectOption('liam');
  await page.locator('#continueUser').click();
  await expect(page.locator('#sidebarUserName')).toHaveText('Liam Brooks');
  await page.getByRole('button', { name: 'Switch role' }).click();
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#welcomeUser')).toHaveValue('liam');
  await expect(page.locator('.cinematic')).toHaveCount(0);
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#sidebarUserName')).toHaveText('Hosis Admin');
});

test('reduced motion keeps the image reveal and direct entry available', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const videoRequests = [];
  page.on('request', request => { if (/\.mp4(?:$|\?)/.test(request.url())) videoRequests.push(request.url()); });
  await page.goto(site);
  await expect(page.locator('.cinematic-visual')).toHaveCSS('opacity', '1');
  await expect(page.locator('video')).toHaveCount(0);
  await enterIntro(page);
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#app')).toBeVisible();
  expect(videoRequests).toHaveLength(0);
});

test('intro and login remain usable on phone, tablet and desktop', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [{ width: 375, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(size);
    await page.goto(site);
    await expect(page.getByRole('button', { name: 'ENTER WORKSPACE' })).toBeVisible();
    let widths = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(widths[0]).toBeLessThanOrEqual(widths[1] + 1);
    await enterIntro(page);
    widths = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(widths[0]).toBeLessThanOrEqual(widths[1] + 1);
    await page.locator('#welcomeUser').selectOption('sofia');
    await page.locator('#continueUser').click();
    await expect(page.locator('#sidebarUserName')).toHaveText('Sofia Martinez');
  }
});
