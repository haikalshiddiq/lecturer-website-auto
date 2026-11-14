import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { createHash } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import net from 'node:net';
import { chromium } from 'playwright';

const port = await new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => { const selected = probe.address().port; probe.close(() => resolve(selected)); });
});
const origin = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
const results = [];
let server;
let browser;
const digest = (value) => createHash('sha256').update(value).digest('hex');

try {
  if (!process.env.SMOKE_BASE_URL) {
    server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], { stdio: ['ignore', 'pipe', 'pipe'], detached: true });
    server.stdout.on('data', (data) => process.stdout.write(data));
    server.stderr.on('data', (data) => process.stderr.write(data));
  }
  let available = false;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try { if ((await fetch(`${origin}/aifn/manifest.webmanifest`)).ok) { available = true; break; } } catch { /* The owned preview has not bound its port yet. */ }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  assert(available, 'AiFn preview/production manifest did not become available');
  browser = await chromium.launch({ headless: true });
  await mkdir('output/playwright', { recursive: true });
  for (const profile of [{ name: 'desktop', viewport: { width: 1440, height: 1000 } }, { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }]) {
    const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(`${origin}/aifn/`, { waitUntil: 'networkidle' });
    assert.equal(await page.locator('link[rel="manifest"]').count(), 1, 'A page must not advertise two competing manifests');
    assert.equal(await page.locator('link[rel="manifest"]').getAttribute('href'), '/aifn/manifest.webmanifest');
    const manifest = await (await context.request.get(`${origin}/aifn/manifest.webmanifest`)).json();
    assert.equal(manifest.id, '/aifn/app');
    assert.equal(manifest.scope, '/aifn/');
    assert.equal(manifest.start_url, '/aifn/studio?source=pwa');
    assert.equal(manifest.display, 'standalone');
    for (const icon of manifest.icons) {
      const response = await context.request.get(`${origin}${icon.src}`);
      assert(response.ok(), `Icon unavailable: ${icon.src}`);
      const buffer = await response.body();
      assert.equal(buffer.subarray(1, 4).toString(), 'PNG');
      assert.equal(`${buffer.readUInt32BE(16)}x${buffer.readUInt32BE(20)}`, icon.sizes);
    }
    // This fixture exercises the unsupported/dismissed native-prompt path, not a real phone installation.
    await page.evaluate(() => {
      const event = new Event('beforeinstallprompt', { cancelable: true });
      event.prompt = async () => { throw new Error('Test fixture: native install unavailable'); };
      event.userChoice = Promise.resolve({ outcome: 'dismissed' });
      window.dispatchEvent(event);
    });
    await page.locator('#aifn-install').click();
    await page.locator('#aifn-install-help').waitFor({ state: 'visible' });
    await page.keyboard.press('Escape');
    await page.locator('#aifn-install-help').waitFor({ state: 'hidden' });
    assert.equal(await page.locator('#aifn-install').evaluate((node) => node === document.activeElement), true, 'Install help must restore keyboard focus');

    await page.waitForFunction(() => document.documentElement.dataset.aifnOffline === 'ready', null, { timeout: 45000 });
    await context.setOffline(true);
    await page.goto(`${origin}${manifest.start_url}`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-aifn-studio]').waitFor({ state: 'visible' });
    await page.locator('[data-course-visual]').waitFor({ state: 'attached' });
    await context.setOffline(false);
    await page.goto(`${origin}/aifn/studio#6`, { waitUntil: 'networkidle' });
    await page.waitForFunction(() => localStorage.getItem('hicall-aifn-last-session-v1') === '6');
    await page.waitForFunction(() => document.documentElement.dataset.aifnOffline === 'ready', null, { timeout: 45000 });
    await page.locator('#aifn-offline-prepare').click();
    await page.waitForFunction(() => document.documentElement.dataset.aifnOffline === 'ready', null, { timeout: 45000 });
    const receipt = await page.evaluate(async () => {
      const cache = await caches.open('hicall-aifn-pack-v2');
      const metadata = await (await cache.match('/aifn/offline-receipt.json')).json();
      for (const url of metadata.urls) if (!(await cache.match(url))?.ok) throw new Error(`Incomplete offline resource: ${url}`);
      return metadata;
    });
    assert(receipt.urls.includes(manifest.start_url));
    assert(receipt.urls.includes('/aifn/data/credit.json'));
    assert(receipt.urls.some((url) => url.startsWith('/_astro/') && url.endsWith('.js')));
    await page.goto(`${origin}/aifn/`, { waitUntil: 'networkidle' });
    await page.locator('#aifn-resume').click();
    await page.waitForURL('**/aifn/studio*#6');
    await page.waitForFunction(() => document.documentElement.dataset.aifnOffline === 'ready', null, { timeout: 45000 });
    await context.setOffline(true);
    await page.goto(`${origin}${manifest.start_url}`, { waitUntil: 'domcontentloaded' });
    await page.waitForURL('**#6');
    await page.locator('[data-aifn-studio]').waitFor({ state: 'visible' });
    await page.locator('[data-course-visual]').waitFor({ state: 'attached' });
    for (const pathname of ['/aifn/data/credit.json', '/aifn/aifn-labs.ipynb', '/aifn/aifn-finance.csv', '/aifn/aifn-labs.py']) {
      const text = await page.evaluate(async (url) => { const response = await fetch(url); if (!response.ok) throw new Error(`Offline HTTP ${response.status}: ${url}`); return response.text(); }, pathname);
      assert.equal(digest(text), digest(await readFile(`public${pathname}`, 'utf8')), `Offline bytes differ: ${pathname}`);
    }
    await page.goto(`${origin}/aifn/studio?mode=teach#13`, { waitUntil: 'domcontentloaded' });
    await page.locator('[data-aifn-studio]').waitFor({ state: 'visible' });
    await page.locator('[data-course-visual]').waitFor({ state: 'attached' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `PWA page overflow ${overflow}px`);
    await page.screenshot({ path: `output/playwright/aifn-pwa-${profile.name}.png`, fullPage: true });
    assert.deepEqual(errors, [], `${profile.name} PWA page errors`);
    results.push({ profile: profile.name, manifest: 'PASS', icons: manifest.icons.length, installHelpFallback: 'PASS (simulated native unavailability)', resume: 'PASS: session 6', cachedAssets: receipt.urls.length, offlineStartAndTeacher: 'PASS', exactOfflineDownloads: 4, overflow, errors });
    await context.close();
  }
  assert.equal(new Set(results.map((entry) => entry.profile)).size, 2);
  await writeFile('output/aifn-pwa-results.json', `${JSON.stringify({ origin, verifiedAt: new Date().toISOString(), results, limitations: ['Chromium viewport emulation, not physical Android/iOS installation.', 'Native installation prompt is not accepted by this test; unsupported-prompt guidance is exercised with an explicit fixture.'] }, null, 2)}\n`);
  console.log(JSON.stringify(results, null, 2));
} finally {
  await browser?.close();
  if (server?.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch { server.kill('SIGTERM'); } }
}
