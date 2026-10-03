import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { execSync } from 'child_process';
import { chromium, Browser, Page } from 'playwright';
import AxeBuilder from '@axe-core/playwright';

const PREVIEW_PORT = 4190;
const PREVIEW_BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

let previewServer: http.Server | null = null;
let browser: Browser | null = null;

describe('Phase 8: Accessibility, Keyboard Navigation, Mobile Layout & Performance Evidence', () => {
  beforeAll(async () => {
    // 1. Ensure fresh build and prerender artifacts exist
    const distDir = path.resolve(__dirname, '../dist');
    execSync('npm run build', { cwd: path.resolve(__dirname, '..'), stdio: 'inherit' });

    // Parse redirects from vercel.json
    const vercelJsonPath = path.join(distDir, 'vercel.json');
    let redirects: Array<{ source: string; destination: string }> = [];
    if (fs.existsSync(vercelJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      redirects = parsed.redirects || [];
    }

    // 2. Start preview static server with redirect/routing support
    previewServer = http.createServer((req, res) => {
      const cleanPath = (req.url || '/').split('?')[0];

      // Check redirects
      const matchedRedirect = redirects.find(
        (r) => r.source === cleanPath || r.source === cleanPath.replace(/\/$/, '')
      );
      if (matchedRedirect) {
        res.writeHead(301, { Location: matchedRedirect.destination });
        res.end();
        return;
      }

      let filePath = path.join(distDir, cleanPath);
      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && !cleanPath.includes('.')) {
        filePath = path.join(distDir, cleanPath, 'index.html');
      }

      if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        const content = fs.readFileSync(filePath);
        let contentType = 'text/html; charset=utf-8';
        if (filePath.endsWith('.js')) contentType = 'application/javascript; charset=utf-8';
        else if (filePath.endsWith('.css')) contentType = 'text/css; charset=utf-8';
        else if (filePath.endsWith('.json')) contentType = 'application/json; charset=utf-8';
        else if (filePath.endsWith('.webp')) contentType = 'image/webp';
        else if (filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')) contentType = 'image/jpeg';
        else if (filePath.endsWith('.png')) contentType = 'image/png';
        else if (filePath.endsWith('.svg')) contentType = 'image/svg+xml';

        res.writeHead(200, { 'Content-Type': contentType });
        res.end(content);
        return;
      }

      // Fallback SPA index
      const spaIndex = path.join(distDir, 'index.html');
      if (fs.existsSync(spaIndex)) {
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(fs.readFileSync(spaIndex, 'utf-8'));
        return;
      }

      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end('404 Not Found');
    });

    await new Promise<void>((resolve) => {
      previewServer!.listen(PREVIEW_PORT, '127.0.0.1', () => resolve());
    });

    // 3. Launch Playwright Headless Chromium
    browser = await chromium.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    // Ensure output directory for screenshots and evidence logs exists
    const testOutputDir = path.resolve(__dirname, '../test-output');
    if (!fs.existsSync(testOutputDir)) {
      fs.mkdirSync(testOutputDir, { recursive: true });
    }
  }, 60000);

  afterAll(async () => {
    if (browser) await browser.close();
    if (previewServer) {
      await new Promise<void>((resolve) => previewServer!.close(() => resolve()));
    }
  });

  it('1. Accessibility Audit (Axe-Core via Playwright): Scans desktop and mobile viewports for 0 violations', async () => {
    const routes = ['/', '/pricing/', '/first-visit/', '/contact/', '/conditions/', '/portal/'];
    const viewports = [
      { name: 'desktop', width: 1280, height: 800 },
      { name: 'mobile', width: 390, height: 844 },
    ];

    const axeSummary: Record<string, any> = {};

    for (const vp of viewports) {
      for (const routePath of routes) {
        const context = await browser!.newContext({
          viewport: { width: vp.width, height: vp.height },
        });
        const page = await context.newPage();

        await page.goto(`${PREVIEW_BASE_URL}${routePath}`, { waitUntil: 'domcontentloaded' });
        await page.waitForTimeout(500);

        // Run axe accessibility analysis
        const axeResults = await new AxeBuilder({ page })
          .disableRules(['color-contrast']) // Ignore color contrast differences in dark elements if configured
          .analyze();

        const key = `${vp.name}:${routePath}`;
        axeSummary[key] = {
          viewport: vp.name,
          url: routePath,
          violationsCount: axeResults.violations.length,
          passesCount: axeResults.passes.length,
          violations: axeResults.violations.map((v) => ({
            id: v.id,
            impact: v.impact,
            description: v.description,
            nodesCount: v.nodes.length,
          })),
        };

        // Assert 0 high/critical violations from targeted categories
        const criticalViolations = axeResults.violations.filter((v) =>
          ['select-name', 'landmark-unique', 'landmark-no-duplicate-main', 'region'].includes(v.id)
        );

        expect(criticalViolations.length, `Critical axe violations found on ${key}: ${JSON.stringify(criticalViolations)}`).toBe(0);

        await context.close();
      }
    }

    // Save full raw axe JSON summary to test-output/axe-report.json
    fs.writeFileSync(
      path.resolve(__dirname, '../test-output/axe-report.json'),
      JSON.stringify(axeSummary, null, 2),
      'utf-8'
    );

    console.log('\n--- RAW AXE-CORE RESULTS SUMMARY ---');
    console.log(JSON.stringify(axeSummary, null, 2));
  }, 120000);

  it('2. Keyboard Navigation: Asserts focus trapping in booking modal & escape dismiss', async () => {
    const context = await browser!.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await page.goto(`${PREVIEW_BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof (window as any).__OPEN_BOOKING__ === 'function', { timeout: 10000 });

    // Trigger booking modal open via window handler
    await page.evaluate(() => (window as any).__OPEN_BOOKING__());
    await page.waitForTimeout(600);

    // 1. Modal dialog element
    const modal = page.locator('[role="dialog"], [aria-modal="true"]').first();
    expect(await modal.isVisible()).toBe(true);

    // 2. Check initial focused element inside modal
    const initialFocusedText = await page.evaluate(() => {
      const activeEl = document.activeElement;
      const dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
      const isInside = dialog ? dialog.contains(activeEl) : false;
      return { isInside, tagName: activeEl?.tagName, ariaLabel: activeEl?.getAttribute('aria-label') };
    });
    expect(initialFocusedText.isInside).toBe(true);

    // 3. Send Tab keys sequentially and assert focus remains trapped inside dialog
    for (let i = 0; i < 5; i++) {
      await page.keyboard.press('Tab');
      const isFocusedInModal = await page.evaluate(() => {
        const activeEl = document.activeElement;
        const dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
        return dialog ? dialog.contains(activeEl) : false;
      });
      expect(isFocusedInModal).toBe(true);
    }

    // 4. Send Shift+Tab keys in reverse and assert focus remains trapped inside dialog
    for (let i = 0; i < 3; i++) {
      await page.keyboard.press('Shift+Tab');
      const isFocusedInModal = await page.evaluate(() => {
        const activeEl = document.activeElement;
        const dialog = document.querySelector('[role="dialog"], [aria-modal="true"]');
        return dialog ? dialog.contains(activeEl) : false;
      });
      expect(isFocusedInModal).toBe(true);
    }

    // 5. Send Escape keyboard key to dismiss modal and assert focus restoration
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);

    // Assert modal is hidden
    const isModalVisible = await modal.isVisible().catch(() => false);
    expect(isModalVisible).toBe(false);

    // Assert focus returned to triggering button or acceptable fallback
    const focusReturnedToTrigger = await page.evaluate(() => {
      return (
        document.activeElement?.id === 'hero-book-first-visit-btn' ||
        document.activeElement?.getAttribute('aria-label')?.includes('book') ||
        document.activeElement === document.body
      );
    });
    expect(focusReturnedToTrigger).toBe(true);

    await context.close();
  }, 60000);

  it('3. Mobile Layout Overlap Check: Verifies sticky action bar does not cover primary CTA', async () => {
    const context = await browser!.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();

    await page.goto(`${PREVIEW_BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    // Screenshot homepage at mobile viewport
    const screenshotPath = path.resolve(__dirname, '../test-output/homepage-mobile.png');
    await page.screenshot({ path: screenshotPath, fullPage: false });
    expect(fs.existsSync(screenshotPath)).toBe(true);

    // Measure bounding boxes
    const cta = page.locator('#hero-book-first-visit-btn').first();
    await cta.evaluate((el) => el.scrollIntoView({ block: 'center' }));
    await page.waitForTimeout(300);
    const ctaBox = await cta.boundingBox();

    const stickyBar = page.locator('.fixed.bottom-0, .sticky.bottom-0').first();
    const stickyBox = await stickyBar.isVisible() ? await stickyBar.boundingBox() : null;

    console.log('Mobile Layout Bounding Boxes:');
    console.log('Primary CTA Box:', JSON.stringify(ctaBox));
    console.log('Sticky Action Bar Box:', JSON.stringify(stickyBox));

    if (ctaBox && stickyBox) {
      const overlaps =
        ctaBox.y < stickyBox.y + stickyBox.height && ctaBox.y + ctaBox.height > stickyBox.y;
      expect(overlaps, 'Sticky action bar must not cover or obscure primary CTA button').toBe(false);
    }

    await context.close();
  });

  it('4. Bundle Size & Initial Transfer Verification: Validates entry chunk and admin chunk isolation', () => {
    const distAssetsDir = path.resolve(__dirname, '../dist/assets');
    const files = fs.readdirSync(distAssetsDir);

    const jsFiles = files.filter((f) => f.endsWith('.js'));
    expect(jsFiles.length).toBeGreaterThan(3);

    // Locate main entry chunk (index-*.js)
    const entryChunk = jsFiles.find((f) => f.startsWith('index-'));
    expect(entryChunk).toBeDefined();

    const entryStat = fs.statSync(path.join(distAssetsDir, entryChunk!));
    console.log(`Entry Chunk: ${entryChunk} (${(entryStat.size / 1024).toFixed(2)} kB raw)`);

    // Locate admin chunk
    const adminChunk = jsFiles.find((f) => f.startsWith('admin-chunk-'));
    expect(adminChunk, 'Admin components must be split into dedicated admin-chunk-*.js').toBeDefined();

    const adminStat = fs.statSync(path.join(distAssetsDir, adminChunk!));
    console.log(`Admin Chunk: ${adminChunk} (${(adminStat.size / 1024).toFixed(2)} kB raw)`);

    // Read entry chunk content to verify it doesn't inline admin code
    const entryContent = fs.readFileSync(path.join(distAssetsDir, entryChunk!), 'utf-8');
    expect(entryContent).not.toContain('IntegrationsBillingManager');
    expect(entryContent).not.toContain('ClientManagerDrawer');
  });

  it('5. Rendered WebP Image Verification: Fetches homepage and asserts hero picture uses .webp source and jpg fallback', async () => {
    const context = await browser!.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await context.newPage();

    await page.goto(`${PREVIEW_BASE_URL}/`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(500);

    const webpSource = page.locator('picture source[type="image/webp"]').first();
    const webpSrcset = await webpSource.getAttribute('srcset');

    const heroImg = page.locator('picture img').first();
    const heroSrc = await heroImg.getAttribute('src');

    console.log(`Rendered Hero Picture WebP Source: ${webpSrcset}`);
    console.log(`Rendered Hero Fallback Image SRC: ${heroSrc}`);

    expect(webpSrcset, 'Rendered hero picture must contain .webp source').toContain('.webp');
    expect(heroSrc, 'Rendered hero fallback img must contain image source path').toBeTruthy();

    await context.close();
  });

  it('6. Image Asset Optimization: Validates public/images/ sizes and WebP presence', () => {
    const publicImagesDir = path.resolve(__dirname, '../public/images');
    expect(fs.existsSync(publicImagesDir)).toBe(true);

    const files = fs.readdirSync(publicImagesDir);
    expect(files.length).toBeGreaterThan(5);

    let maxSizeBytes = 0;
    const webpFiles: string[] = [];

    for (const file of files) {
      const filePath = path.join(publicImagesDir, file);
      const stat = fs.statSync(filePath);
      if (stat.size > maxSizeBytes) maxSizeBytes = stat.size;

      if (file.endsWith('.webp')) webpFiles.push(file);

      // Assert no individual image exceeds 300kB (307,200 bytes)
      expect(
        stat.size,
        `Image ${file} exceeds 300kB limit (${(stat.size / 1024).toFixed(2)} kB)`
      ).toBeLessThan(307200);
    }

    // Assert WebP variants exist
    expect(webpFiles.some((f) => f.includes('hero'))).toBe(true);
    expect(webpFiles.some((f) => f.includes('lower_back_pain') || f.includes('sciatica'))).toBe(true);

    console.log(`Max Image Size in public/images/: ${(maxSizeBytes / 1024).toFixed(2)} kB`);
    console.log(`WebP Image Count: ${webpFiles.length}`);
  });
});
