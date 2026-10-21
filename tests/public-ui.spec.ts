import { test, expect } from '@playwright/test';

const routes = [
  { path: '/', name: 'home' },
  { path: '/conditions', name: 'conditions' },
  { path: '/first-visit', name: 'first-visit' },
  { path: '/about', name: 'about' },
  { path: '/team', name: 'team' },
  { path: '/pricing', name: 'pricing' },
  { path: '/contact', name: 'contact' },
  { path: '/blog', name: 'blog' },
];

test.describe('public site desktop', () => {
  test.use({ viewport: { width: 1440, height: 900 } });
  for (const route of routes) {
    test(route.name + ' renders and stays inside viewport', async ({ page }, testInfo) => {
      const failures: string[] = [];
      page.on('pageerror', error => failures.push(error.message));
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('nav[aria-label="Main navigation"]')).toBeVisible();
      await expect.poll(() => page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      )).toBeLessThanOrEqual(2);
      await page.screenshot({ path: testInfo.outputPath(route.name + '-desktop.png'), fullPage: true });
      expect(failures, 'Page should not throw uncaught JavaScript errors').toEqual([]);
    });
  }
});

test.describe('public site mobile', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  for (const route of routes) {
    test(route.name + ' is usable at 390px', async ({ page }, testInfo) => {
      const failures: string[] = [];
      page.on('pageerror', error => failures.push(error.message));
      await page.goto(route.path, { waitUntil: 'domcontentloaded' });
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect.poll(() => page.evaluate(() =>
        document.documentElement.scrollWidth - document.documentElement.clientWidth
      )).toBeLessThanOrEqual(2);
      await page.screenshot({ path: testInfo.outputPath(route.name + '-mobile.png'), fullPage: true });
      expect(failures).toEqual([]);
    });
  }

  test('mobile navigation opens and reaches Fees', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const menu = page.getByRole('button', { name: 'Open menu' });
    await expect(menu).toBeVisible();
    await menu.click();
    const mobileNav = page.locator('#pv2-mobile-nav');
    await expect(mobileNav).toBeVisible();
    await mobileNav.getByRole('link', { name: /Fees/ }).click();
    await expect(page).toHaveURL(/\/pricing$/);
    await expect(page.locator('main h1').first()).toBeVisible();
  });

  test('motion preferences and focusable booking CTA', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const action = page.locator('#hero-book-first-visit-btn');
    await expect(action).toBeVisible();
    await action.focus();
    await expect(action).toBeFocused();
  });
});
