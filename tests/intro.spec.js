const { test, expect } = require('@playwright/test');
const site = 'http://127.0.0.1:4173';
const sessionKey = 'hosis-video-annotated-seen-v1';

test('supplied video plays, pauses, finishes and replays', async ({ page }) => {
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(site);
  const video = page.locator('video.cinematic-video');
  await expect(video).toHaveAttribute('src', /hosis-intro-annotated.mp4$/);
  await expect.poll(() => video.evaluate(v => v.currentTime)).toBeGreaterThan(0);
  await page.getByRole('button', { name: 'Pause intro' }).click();
  await expect(video).toHaveJSProperty('paused', true);
  await page.screenshot({ path: 'test-results/video-intro-desktop.png' });
  await page.getByRole('button', { name: 'Resume intro' }).click();
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible({ timeout: 15000 });
  await expect(page.locator('.cinematic-fallback')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/video-intro-welcome.png' });
  await page.getByRole('button', { name: 'Replay Intro', exact: true }).click();
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toHaveCount(0);
  await expect.poll(() => video.evaluate(v => !v.paused && v.currentTime > 0 && v.currentTime < 4)).toBe(true);
  expect(errors).toEqual([]);
});

test('skip works before video loads and replay preserves role selection', async ({ page }) => {
  await page.route('**/hosis-intro-annotated.mp4', route => route.abort());
  await page.goto(site);
  await page.getByRole('button', { name: /Skip Intro/i }).click();
  await expect(page.getByRole('button', { name: 'Continue as Admin' })).toBeVisible();
  await expect(page.locator('video')).toHaveCount(0);
  expect(await page.evaluate(key => sessionStorage.getItem(key), sessionKey)).toBe('1');
  await page.getByRole('button', { name: /Replay Intro/i }).click();
  await expect(page.getByRole('button', { name: /Skip Intro/i })).toBeVisible();
});

test('completed video session goes straight to role selection', async ({ page }) => {
  await page.addInitScript(key => sessionStorage.setItem(key, '1'), sessionKey);
  await page.goto(site);
  await expect(page.locator('#welcome')).toBeVisible();
  await expect(page.locator('#intro')).toBeHidden();
  await expect(page.locator('video')).toHaveCount(0);
});

test('viewing the old map intro does not skip the new video', async ({ page }) => {
  await page.addInitScript(() => sessionStorage.setItem('hosis-cinematic-seen-v1', '1'));
  await page.goto(site);
  await expect(page.locator('video.cinematic-video')).toBeVisible();
});

test('reduced motion uses matching static poster without loading video or map', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  const requests = [];
  page.on('request', request => { if (/\.mp4|openfreemap/.test(request.url())) requests.push(request.url()); });
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible();
  await expect(page.locator('.cinematic-video-poster')).toHaveAttribute('src', /hosis-intro-annotated-poster.jpg$/);
  expect(requests).toHaveLength(0);
  await page.getByRole('button', { name: 'Enter Project Hub' }).click();
  await expect(page.locator('#welcome')).toBeVisible();
});

test('video failure offers immediate entry', async ({ page }) => {
  await page.route('**/hosis-intro-annotated.mp4', route => route.abort());
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText('The video could not load. You can still enter the hub.')).toBeVisible();
});

test('autoplay denial offers manual playback without blocking entry', async ({ page }) => {
  await page.addInitScript(() => {
    HTMLMediaElement.prototype.play = () => Promise.reject(new DOMException('Autoplay blocked', 'NotAllowedError'));
  });
  await page.goto(site);
  await expect(page.getByRole('button', { name: 'Resume intro' })).toBeVisible();
  await page.getByRole('button', { name: 'Skip Intro' }).click();
  await expect(page.locator('#welcome')).toBeVisible();
});

test('mobile video keeps the full frame and welcome fits portrait and landscape', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto(site);
  await expect(page.locator('video')).toHaveCSS('object-fit', 'contain');
  await page.getByRole('button', { name: 'Pause intro' }).click();
  await page.screenshot({ path: 'test-results/video-intro-mobile.png' });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const size of [{ width: 390, height: 844 }, { width: 844, height: 390 }]) {
    await page.setViewportSize(size);
    await expect(page.getByRole('button', { name: 'Enter Project Hub' })).toBeInViewport();
    const width = await page.evaluate(() => [document.documentElement.scrollWidth, innerWidth]);
    expect(width[0]).toBeLessThanOrEqual(width[1]);
  }
});
