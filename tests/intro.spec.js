const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';

test('single entry screen keeps role controls over the supplied video through playback and replay', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(site);
  const video = page.locator('video.cinematic-video');
  await expect(video).toHaveAttribute('src', /hosis-intro-annotated.mp4$/);
  await expect(page.locator('#intro #welcome')).toBeVisible();
  await expect(page.locator('.welcome-media')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Continue as Admin' })).toBeVisible();
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause intro', exact: true }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await page.screenshot({ path: 'test-results/unified-entry-desktop.png' });
  await page.getByRole('button', { name: 'Resume intro' }).click();
  await expect(video).toHaveJSProperty('ended', true, { timeout: 15000 });
  await expect(page.locator('.cinematic-fallback')).toHaveCount(0);
  await expect(page.locator('#welcome')).toBeVisible();
  await page.getByRole('button', { name: 'Replay Intro', exact: true }).click();
  await expect.poll(() => video.evaluate(v => !v.paused && v.currentTime > 0 && v.currentTime < 4)).toBe(true);
  await expect(page.locator('#welcome')).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#app')).toBeVisible();
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('video')).toHaveCount(0);
  expect(errors).toEqual([]);
});

test('skip focuses the same role panel and role switching returns to the same video entry', async ({ page }) => {
  await page.goto(site);
  await page.getByRole('button', { name: 'Skip Intro' }).click();
  await expect(page.locator('#welcomeTitle')).toBeFocused();
  await expect(page.locator('#intro')).toBeVisible();
  await page.locator('#welcomeUser').selectOption('liam');
  await page.locator('#continueUser').click();
  await expect(page.locator('#sidebarUserName')).toHaveText('Liam Brooks');
  await page.getByRole('button', { name: 'Switch role' }).click();
  await expect(page.locator('#intro #welcome')).toBeVisible();
  await expect(page.locator('#welcomeUser')).toHaveValue('liam');
  await expect(page.locator('video.cinematic-video')).toHaveCount(1);
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#sidebarUserName')).toHaveText('Hosis Admin');
});

test('old session flags do not hide the unified welcome screen', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('hosis-video-annotated-seen-v1', '1');
    sessionStorage.setItem('hosis-cinematic-seen-v1', '1');
  });
  await page.goto(site);
  await expect(page.locator('#intro #welcome')).toBeVisible();
  await expect(page.locator('video.cinematic-video')).toHaveCount(1);
});

test('reduced motion uses only the matching poster and still allows direct entry', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', request => { if (/\.mp4|openfreemap/.test(request.url())) requests.push(request.url()); });
  await page.goto(site);
  await expect(page.locator('.cinematic-video-poster')).toHaveAttribute('src', /hosis-intro-annotated-poster.jpg$/);
  await expect(page.locator('video')).toHaveCount(0);
  await expect(page.getByRole('button', { name: 'Replay Intro' })).toBeDisabled();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#app')).toBeVisible();
  expect(requests).toHaveLength(0);
});

test('failed media and blocked autoplay never block selecting a role', async ({ page }) => {
  await page.route('**/hosis-intro-annotated.mp4', route => route.abort());
  await page.goto(site);
  await expect(page.getByText('The video could not load. You can still enter the hub.')).toBeVisible();
  await page.getByRole('button', { name: 'Continue as Admin' }).click();
  await expect(page.locator('#app')).toBeVisible();
  await page.unroute('**/hosis-intro-annotated.mp4');
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'));
  });
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Resume intro' })).toBeVisible();
  await page.locator('#continueUser').click();
  await expect(page.locator('#app')).toBeVisible();
});

test('entry remains usable on narrow phones and short landscape screens', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [{ width: 375, height: 844 }, { width: 844, height: 390 }, { width: 1440, height: 960 }]) {
    await page.setViewportSize(size);
    await page.goto(site);
    await expect(page.locator('.cinematic-video-poster')).toHaveCSS('object-fit', 'contain');
    const width = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(width[0]).toBeLessThanOrEqual(width[1]);
    if (size.width === 375) await page.screenshot({ path: 'test-results/unified-entry-mobile.png' });
    await page.locator('#welcomeUser').selectOption('sofia');
    await page.locator('#continueUser').click();
    await expect(page.locator('#sidebarUserName')).toHaveText('Sofia Martinez');
  }
});
