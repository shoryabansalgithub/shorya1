/* eslint-disable no-console */
/**
 * Headless browser smoke sweep for every top-level page.
 *
 * Loads each route in real Chromium, waits for client data to settle, and
 * asserts: zero uncaught page errors, zero console errors (dev-only noise
 * filtered), zero failed network requests, no 4xx/5xx API responses, and no
 * crash/error-boundary text. Screenshots land in OUT for eyeballing.
 *
 * Usage (servers must be running):
 *   BASE_URL=http://localhost:3000 node apps/web/e2e/smoke-sweep.mjs
 *
 * Exits non-zero if any page has a defect, so it can gate CI.
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';

const BASE = process.env.BASE_URL ?? 'http://localhost:3000';
const OUT = process.env.SWEEP_OUT ?? '/tmp/dukanai-sweep';
mkdirSync(OUT, { recursive: true });

const ROUTES = [
  ['landing', '/'],
  ['login', '/login'],
  ['register', '/register'],
  ['dashboard', '/dashboard'],
  ['products', '/products'],
  ['inventory', '/inventory'],
  ['customers', '/customers'],
  ['billing', '/billing'],
  ['suppliers', '/suppliers'],
  ['employees', '/employees'],
  ['expenses', '/expenses'],
  ['analytics', '/analytics'],
  ['ai-assistant', '/ai-assistant'],
  ['ai-scanner', '/ai-scanner'],
  ['notifications', '/notifications'],
  ['database', '/database'],
  ['settings', '/settings'],
  ['smart-capture', '/smart-capture'],
];

// Dev-only / third-party console noise that is not an app defect.
const IGNORE_CONSOLE = [
  /Download the React DevTools/i,
  /\[Fast Refresh\]/i,
  /React Router Future Flag/i,
];

const CRASH_STRINGS = [
  'Application error',
  'Unhandled Runtime Error',
  'Internal Server Error',
  'This page could not be found',
];

async function sweepRoute(browser, name, path) {
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const consoleErrors = [];
  const pageErrors = [];
  const failedRequests = [];
  const badResponses = [];

  page.on('console', (m) => {
    if (m.type() === 'error') {
      const t = m.text();
      if (!IGNORE_CONSOLE.some((re) => re.test(t))) consoleErrors.push(t);
    }
  });
  page.on('pageerror', (e) => pageErrors.push(String(e)));
  page.on('requestfailed', (r) => {
    // ERR_ABORTED means the browser cancelled the request (e.g. a client-side
    // redirect superseded an in-flight RSC prefetch) - not a real failure.
    // Genuine breakage still surfaces as 404 responses / console errors.
    const err = r.failure()?.errorText ?? '';
    if (err.includes('ERR_ABORTED')) return;
    failedRequests.push(`${r.method()} ${r.url()} :: ${err}`);
  });
  page.on('response', (r) => {
    const s = r.status();
    if (s >= 400 && !r.url().includes('/_next/') && !r.url().includes('favicon')) {
      badResponses.push(`${s} ${r.request().method()} ${r.url()}`);
    }
  });

  await page.goto(BASE + path, { waitUntil: 'networkidle', timeout: 45000 }).catch((e) => {
    pageErrors.push('navigation: ' + String(e).split('\n')[0]);
  });
  await page.waitForTimeout(2000);

  const crash = await page.evaluate((strings) => {
    const body = document.body ? document.body.innerText : '';
    return strings.filter((s) => body.toLowerCase().includes(s.toLowerCase()));
  }, CRASH_STRINGS);

  await page.screenshot({ path: `${OUT}/${name}.png`, fullPage: true }).catch(() => {});
  await ctx.close();

  const issues = [];
  if (pageErrors.length) issues.push(`pageErrors(${pageErrors.length}): ${pageErrors.slice(0, 2).join(' | ')}`);
  if (consoleErrors.length) issues.push(`consoleErrors(${consoleErrors.length}): ${consoleErrors.slice(0, 2).join(' | ')}`);
  if (failedRequests.length) issues.push(`failedRequests(${failedRequests.length}): ${failedRequests.slice(0, 2).join(' | ')}`);
  if (badResponses.length) issues.push(`http4xx5xx(${badResponses.length}): ${badResponses.slice(0, 2).join(' | ')}`);
  if (crash.length) issues.push(`crashText: ${crash.join(', ')}`);
  return issues;
}

(async () => {
  const browser = await chromium.launch();
  let failures = 0;
  for (const [name, path] of ROUTES) {
    const issues = await sweepRoute(browser, name, path);
    if (issues.length) {
      failures += 1;
      console.log(`FAIL ${name.padEnd(15)} ${path}`);
      issues.forEach((i) => console.log(`     - ${i}`));
    } else {
      console.log(`OK   ${name.padEnd(15)} ${path}`);
    }
  }
  await browser.close();
  console.log(`\n${ROUTES.length - failures}/${ROUTES.length} pages clean.`);
  process.exit(failures ? 1 : 0);
})();
