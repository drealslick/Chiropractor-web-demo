import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';
import { execSync } from 'child_process';
import { defaultClinic, defaultPaymentPolicy, conditionsData } from '../src/data/clinicData';
import { defaultPricingFees } from '../src/data/defaultPricingFees';
import { DEFAULT_SERVICE_CATALOG } from '../functions/src/booking';

const APP_URL = (process.env.VITE_APP_URL || 'https://your-clinic.vercel.app').replace(/\/$/, '');
const PREVIEW_PORT = 4189;
const PREVIEW_BASE_URL = `http://127.0.0.1:${PREVIEW_PORT}`;

let previewServer: http.Server | null = null;

describe('Phase 7 Acceptance Suite: Unified Branding, Content, Routes & SEO Prerendering', () => {
  beforeAll(async () => {
    // 1. Execute the REAL build & prerender script
    console.log('Executing real build & prerender script...');
    execSync('npx vite build && npx tsx scripts/prerender.ts', {
      cwd: path.resolve(__dirname, '..'),
      stdio: 'inherit',
      env: { ...process.env, VITE_APP_URL: APP_URL },
    });

    const distDir = path.resolve(__dirname, '../dist');

    // Parse redirects from vercel.json or _redirects
    const vercelJsonPath = path.join(distDir, 'vercel.json');
    let redirects: Array<{ source: string; destination: string }> = [];
    if (fs.existsSync(vercelJsonPath)) {
      const parsed = JSON.parse(fs.readFileSync(vercelJsonPath, 'utf-8'));
      redirects = parsed.redirects || [];
    }

    // 2. Start an HTTP static server with real 301/404 handling
    previewServer = http.createServer((req, res) => {
      const reqUrl = req.url || '/';
      const cleanPath = reqUrl.split('?')[0];

      // Check 301 redirects
      const matchedRedirect = redirects.find(
        (r) => r.source === cleanPath || r.source === cleanPath.replace(/\/$/, '')
      );
      if (matchedRedirect) {
        res.writeHead(301, {
          Location: matchedRedirect.destination,
          'Content-Type': 'text/plain',
        });
        res.end(`Redirecting to ${matchedRedirect.destination}`);
        return;
      }

      // Resolve file path on disk
      let filePath = path.join(distDir, cleanPath);

      if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      } else if (!fs.existsSync(filePath) && !cleanPath.includes('.')) {
        filePath = path.join(distDir, cleanPath, 'index.html');
      }

      if (fs.existsSync(filePath) && !fs.statSync(filePath).isDirectory()) {
        const content = fs.readFileSync(filePath, 'utf-8');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
        res.end(content);
        return;
      }

      // Non-existent route => HTTP 404
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<!DOCTYPE html><html><head><title>404 Not Found</title></head><body><h1>404 Not Found</h1><p>Page does not exist</p></body></html>`);
    });

    await new Promise<void>((resolve) => {
      previewServer!.listen(PREVIEW_PORT, '127.0.0.1', () => {
        console.log(`Preview server listening on ${PREVIEW_BASE_URL}`);
        resolve();
      });
    });
  }, 120000);

  afterAll(async () => {
    if (previewServer) {
      await new Promise<void>((resolve) => previewServer!.close(() => resolve()));
    }
  });

  it('1. Prerender Script Disk Artifacts: Verifies physical output files generated in dist/', () => {
    const distDir = path.resolve(__dirname, '../dist');
    expect(fs.existsSync(distDir)).toBe(true);

    const requiredFiles = [
      'index.html',
      'sitemap.xml',
      'robots.txt',
      'vercel.json',
      '_redirects',
      '.htaccess',
      'conditions/index.html',
      'conditions/lower-back-pain/index.html',
      'pricing/index.html',
      'team/index.html',
      'contact/index.html',
      'portal/index.html',
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(distDir, file);
      expect(fs.existsSync(filePath), `Expected prerendered file ${file} to exist on disk`).toBe(true);
      const stat = fs.statSync(filePath);
      expect(stat.size).toBeGreaterThan(10);
    }
  });

  it('2. Sitemap Domain & Indexing Rules: Ensures sitemap contains deployed domain and excludes private routes', () => {
    const distDir = path.resolve(__dirname, '../dist');
    const sitemapContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');

    expect(sitemapContent).toContain(APP_URL);
    expect(sitemapContent).not.toContain('YOUR-CLINIC.com');
    expect(sitemapContent).not.toContain('your-clinic.vercel.app/portal');

    const robotsContent = fs.readFileSync(path.join(distDir, 'robots.txt'), 'utf-8');
    expect(robotsContent).toContain('Disallow: /portal');
    expect(robotsContent).toContain(`Sitemap: ${APP_URL}/sitemap.xml`);
  });

  it('3. Sitemap HTTP Resolution & Content Validity: Verifies HTTP 200 AND absence of "Condition Protocol Not Found"', async () => {
    const distDir = path.resolve(__dirname, '../dist');
    const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');

    const locMatches = Array.from(sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)).map((m) => m[1]);
    expect(locMatches.length).toBeGreaterThan(5);

    for (const locUrl of locMatches) {
      const relativePath = locUrl.replace(APP_URL, '');
      const testUrl = `${PREVIEW_BASE_URL}${relativePath}`;

      const res = await fetch(testUrl, { redirect: 'manual' });
      expect(res.status, `Expected HTTP 200 for ${relativePath} on preview server`).toBe(200);

      const html = await res.text();
      expect(html).toContain('<div id="root">');
      expect(html.toLowerCase()).not.toContain('condition protocol not found');
      expect(html.toLowerCase()).not.toContain('page not found');
    }
  });

  it('4. Heading Alignment for Condition Pages: Asserts primary <h1> matches condition title', async () => {
    const distDir = path.resolve(__dirname, '../dist');
    const sitemapXml = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');

    const locMatches = Array.from(sitemapXml.matchAll(/<loc>(.*?)<\/loc>/g)).map((m) => m[1]);
    const conditionLocs = locMatches.filter((loc) => loc.includes('/conditions/'));

    expect(conditionLocs.length).toBeGreaterThan(0);

    for (const locUrl of conditionLocs) {
      const relativePath = locUrl.replace(APP_URL, '');
      const testUrl = `${PREVIEW_BASE_URL}${relativePath}`;

      const res = await fetch(testUrl, { redirect: 'manual' });
      expect(res.status).toBe(200);
      const html = await res.text();

      const h1Match = html.match(/<h1[^>]*>(.*?)<\/h1>/i);
      expect(h1Match, `Missing <h1> tag on ${relativePath}`).not.toBeNull();
      const h1Text = h1Match![1].trim();

      // Heading must not be generic error/placeholder
      expect(h1Text.length).toBeGreaterThan(5);
      expect(h1Text).not.toContain('Not Found');
    }
  });

  it('5. Price Single-Source-of-Truth Consistency: Parses DOM fee from /pricing/ and compares with server catalog', async () => {
    // 1. Fetch rendered HTML of /pricing/ from preview server
    const res = await fetch(`${PREVIEW_BASE_URL}/pricing/`, { redirect: 'manual' });
    expect(res.status).toBe(200);
    const html = await res.text();

    // 2. Parse numeric fee from data-testid="exam-fee" element in rendered DOM
    const examFeeMatch = html.match(/data-testid=["']exam-fee["'][^>]*>(.*?)<\/h2>/i);
    expect(examFeeMatch, 'data-testid="exam-fee" element must exist on /pricing/ page').not.toBeNull();

    const domPriceString = examFeeMatch![1].trim(); // e.g. "$49"
    const domNumericPrice = parseInt(domPriceString.replace(/[^0-9]/g, ''), 10);
    expect(domNumericPrice).toBeGreaterThan(0);

    // 3. Compare with booking server catalog price
    const initialConsultation = DEFAULT_SERVICE_CATALOG['initial-consultation'];
    expect(initialConsultation).toBeDefined();
    const bookingServerPrice = initialConsultation.price;

    // 4. Compare with payment policy catalog
    const paymentPolicyPrice = defaultPaymentPolicy.fullFeeAmount;

    // Strict equality checks
    expect(domNumericPrice, 'Rendered DOM price on /pricing/ must match booking server catalog').toBe(bookingServerPrice);
    expect(domNumericPrice, 'Rendered DOM price on /pricing/ must match payment policy catalog').toBe(paymentPolicyPrice);
  });

  it('6. Soft 404 Prevention: Asserts non-existent route /conditions/this-does-not-exist returns HTTP 404', async () => {
    const testUrl = `${PREVIEW_BASE_URL}/conditions/this-does-not-exist`;
    const res = await fetch(testUrl, { redirect: 'manual' });

    expect(res.status, 'Non-existent route must return HTTP 404 status').toBe(404);
  });

  it('7. 301 Redirect for Legacy Slugs: Verifies old slug /conditions/back-lower-back-pain redirects 301 to new canonical slug', async () => {
    const legacyUrl = `${PREVIEW_BASE_URL}/conditions/back-lower-back-pain`;
    const res = await fetch(legacyUrl, { redirect: 'manual' });

    expect(res.status, 'Legacy condition slug must return HTTP 301 redirect').toBe(301);
    const locationHeader = res.headers.get('location');
    expect(locationHeader, 'Location header must point to /conditions/lower-back-pain/').toBe('/conditions/lower-back-pain/');
  });

  it('8. Private Route Security: Asserts /portal/ contains noindex meta tag and is omitted from sitemap.xml', async () => {
    // 1. Fetch /portal/ from preview server
    const res = await fetch(`${PREVIEW_BASE_URL}/portal/`, { redirect: 'manual' });
    expect(res.status).toBe(200);
    const html = await res.text();

    // 2. Assert <meta name="robots" content="noindex, nofollow" />
    expect(html).toMatch(/<meta\s+name=["']robots["']\s+content=["']noindex/i);

    // 3. Assert /portal/ is omitted from sitemap.xml
    const distDir = path.resolve(__dirname, '../dist');
    const sitemapContent = fs.readFileSync(path.join(distDir, 'sitemap.xml'), 'utf-8');
    expect(sitemapContent).not.toContain('/portal');
  });
});
