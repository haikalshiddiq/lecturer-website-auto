import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import net from 'node:net';
import process from 'node:process';
import { chromium } from 'playwright';

const reserveFreePort = () => new Promise((resolve, reject) => {
  const probe = net.createServer();
  probe.once('error', reject);
  probe.listen(0, '127.0.0.1', () => {
    const address = probe.address();
    probe.close(() => resolve(address.port));
  });
});

const port = Number(process.env.SMOKE_PORT || await reserveFreePort());
const baseUrl = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${port}`;
const ownsServer = !process.env.SMOKE_BASE_URL;
let server;
let browser;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const waitForServer = async () => {
  let lastError;
  for (let attempt = 0; attempt < 30; attempt += 1) {
    try {
      const response = await fetch(baseUrl);
      if (response.ok) return;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(`Preview did not become ready: ${lastError}`);
};

const stopServer = () => {
  if (server && !server.killed) {
    try {
      if (process.platform === 'win32') server.kill('SIGTERM');
      else process.kill(-server.pid, 'SIGTERM');
    } catch {
      server.kill('SIGTERM');
    }
  }
};

try {
  if (ownsServer) {
    server = spawn(process.platform === 'win32' ? 'npm.cmd' : 'npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], {
      cwd: process.cwd(),
      env: process.env,
      stdio: ['ignore', 'pipe', 'pipe'],
      detached: process.platform !== 'win32'
    });
    server.stdout.on('data', (chunk) => process.stdout.write(chunk));
    server.stderr.on('data', (chunk) => process.stderr.write(chunk));
    server.once('exit', (code) => {
      if (code && code !== 0) process.stderr.write(`Preview exited with code ${code}\n`);
    });
  }

  await waitForServer();
  const manifestResponse = await fetch(`${baseUrl}/manifest.webmanifest`);
  assert(manifestResponse.ok, 'Manifest request failed');
  const manifest = await manifestResponse.json();
  assert(manifest.display === 'standalone', 'Manifest display must be standalone');
  for (const required of ['192x192', '512x512']) {
    assert(manifest.icons.some((icon) => icon.type === 'image/png' && icon.sizes === required), `Manifest PNG ${required} icon is missing`);
  }
  assert(manifest.icons.some((icon) => icon.sizes === '512x512' && icon.purpose === 'maskable'), 'Manifest maskable icon is missing');

  await mkdir('output/playwright', { recursive: true });
  browser = await chromium.launch({ headless: true });
  const results = [];

  for (const profile of [
    { name: 'desktop', viewport: { width: 1440, height: 1000 } },
    { name: 'mobile', viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true }
  ]) {
    const context = await browser.newContext({ viewport: profile.viewport, isMobile: profile.isMobile, hasTouch: profile.hasTouch });
    const page = await context.newPage();
    const errors = [];
    page.on('console', (message) => {
      if (message.type() !== 'error') return;
      if (message.location().url.includes('/_vercel/speed-insights/')) return;
      errors.push(message.text());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('response', (response) => {
      if (response.status() >= 400 && !response.url().includes('/_vercel/speed-insights/')) {
        errors.push(`HTTP ${response.status()} ${response.url()}`);
      }
    });

    await page.goto(baseUrl, { waitUntil: 'networkidle' });
    await page.locator('[data-learning-workspace]').waitFor({ state: 'visible' });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    assert(overflow <= 1, `${profile.name} has ${overflow}px horizontal overflow`);

    const themeToggle = page.locator('[data-theme-toggle]');
    await themeToggle.click();
    const selectedTheme = await page.evaluate(() => localStorage.getItem('theme'));
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.evaluate((theme) => localStorage.getItem('theme') === theme && document.documentElement.dataset.theme === theme, selectedTheme), `${profile.name} theme did not persist`);

    const firstCheckpoint = page.locator('[data-checkpoint]').first();
    await firstCheckpoint.check();
    await page.reload({ waitUntil: 'networkidle' });
    assert(await page.locator('[data-checkpoint]').first().isChecked(), `${profile.name} checkpoint did not persist`);

    const activeQuiz = page.locator('[data-module-panel]:not([hidden]) [data-quiz]');
    const answer = await activeQuiz.getAttribute('data-answer');
    await activeQuiz.locator(`[data-quiz-option="${answer.replaceAll('"', '\\"')}"]`).click();
    await page.getByText('Correct. This outcome is published in the selected topic.').waitFor();

    const registration = await page.evaluate(async () => {
      const ready = await navigator.serviceWorker.ready;
      return Boolean(ready.active && ready.active.scriptURL.endsWith('/sw.js'));
    });
    assert(registration, `${profile.name} service worker is not active`);

    await page.screenshot({ path: `output/playwright/${profile.name}.png`, fullPage: true });
    assert(errors.length === 0, `${profile.name} console errors: ${errors.join(' | ')}`);
    results.push(`${profile.name}: interactive progress, quiz, theme, service worker, overflow PASS`);
    await context.close();
  }

  const offlineContext = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const offlinePage = await offlineContext.newPage();
  await offlinePage.goto(baseUrl, { waitUntil: 'networkidle' });
  await offlinePage.evaluate(() => navigator.serviceWorker.ready);
  await offlineContext.setOffline(true);
  const offlineResponse = await offlinePage.goto(`${baseUrl}/offline-smoke-route`, { waitUntil: 'domcontentloaded' });
  assert(offlineResponse?.status() === 200, 'Offline fallback did not return HTTP 200');
  assert(await offlinePage.getByRole('heading', { name: 'You are offline.' }).isVisible(), 'Offline fallback page is not visible');
  results.push('offline navigation: fallback PASS');
  await offlineContext.close();
  await browser.close();
  browser = undefined;

  console.log(`PWA smoke passed (${results.length} checks)`);
  results.forEach((result) => console.log(`- ${result}`));
} finally {
  await browser?.close().catch(() => undefined);
  stopServer();
}
