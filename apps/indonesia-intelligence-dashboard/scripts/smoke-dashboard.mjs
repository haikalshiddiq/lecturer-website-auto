import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import process from 'node:process';

const port = 4179;
const baseURL = `http://127.0.0.1:${port}`;
const artifacts = new URL('../artifacts/', import.meta.url);
await mkdir(artifacts, { recursive: true });

const server = spawn(process.execPath, ['./node_modules/vite/bin/vite.js', 'preview', '--host', '127.0.0.1', '--port', String(port)], {
  cwd: new URL('..', import.meta.url),
  stdio: ['ignore', 'pipe', 'pipe'],
});

const waitForServer = async () => {
  for (let attempt = 0; attempt < 50; attempt += 1) {
    try {
      const response = await fetch(baseURL);
      if (response.ok) return;
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  throw new Error('Vite preview did not become ready');
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });

  for (const viewport of [
    { name: 'desktop', width: 1440, height: 1000 },
    { name: 'mobile', width: 390, height: 844 },
  ]) {
    const page = await browser.newPage({ viewport, colorScheme: 'light' });
    const runtimeErrors = [];
    page.on('console', message => {
      if (message.type() === 'error') runtimeErrors.push(`console: ${message.text()}`);
    });
    page.on('pageerror', error => runtimeErrors.push(`page: ${error.message}`));

    const response = await page.goto(baseURL, { waitUntil: 'networkidle' });
    assert(response?.ok(), `${viewport.name}: document request failed`);
    await page.locator('.news').first().waitFor({ state: 'visible' });
    await page.waitForTimeout(700);

    assert(await page.locator('.topNav').isVisible(), `${viewport.name}: top navigation is not visible`);
    assert(await page.locator('#overview').isVisible(), `${viewport.name}: overview is not visible`);
    assert(await page.locator('#markets').isVisible(), `${viewport.name}: markets section is not visible`);
    assert(await page.locator('#analytics').isVisible(), `${viewport.name}: analytics section is not visible`);
    assert(await page.locator('#news').isVisible(), `${viewport.name}: news section is not visible`);
    assert(await page.locator('.news h2 a').count() >= 8, `${viewport.name}: too few linked news items rendered`);

    const geometry = await page.evaluate(() => ({
      scrollWidth: document.documentElement.scrollWidth,
      clientWidth: document.documentElement.clientWidth,
      bodyBackground: getComputedStyle(document.body).backgroundColor,
      h1Lines: Math.round(document.querySelector('.hero h1').getBoundingClientRect().height / parseFloat(getComputedStyle(document.querySelector('.hero h1')).lineHeight)),
    }));
    assert(geometry.scrollWidth <= geometry.clientWidth + 1, `${viewport.name}: horizontal overflow ${geometry.scrollWidth}px > ${geometry.clientWidth}px`);
    assert(geometry.bodyBackground === 'rgb(246, 248, 251)', `${viewport.name}: reference light theme did not apply`);
    assert(geometry.h1Lines <= 4, `${viewport.name}: hero heading wraps to ${geometry.h1Lines} lines`);

    await page.locator('.themeToggle').click();
    const darkState = await page.evaluate(() => ({
      theme: document.documentElement.dataset.theme,
      stored: localStorage.getItem('indonesia-intel-theme'),
      background: getComputedStyle(document.body).backgroundColor,
      themeColor: document.querySelector('meta[name="theme-color"]')?.content,
      overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
    }));
    assert(darkState.theme === 'dark' && darkState.stored === 'dark', `${viewport.name}: dark preference was not applied and persisted`);
    assert(darkState.background === 'rgb(11, 17, 32)', `${viewport.name}: dark background token did not apply`);
    assert(darkState.themeColor === '#0b1120', `${viewport.name}: dark browser theme color did not update`);
    assert(darkState.overflow <= 1, `${viewport.name}: dark mode caused horizontal overflow`);
    await page.screenshot({ path: new URL(`dashboard-${viewport.name}-dark.png`, artifacts).pathname, fullPage: true });

    await page.reload({ waitUntil: 'networkidle' });
    await page.locator('.news').first().waitFor({ state: 'visible' });
    assert(await page.evaluate(() => document.documentElement.dataset.theme === 'dark'), `${viewport.name}: dark preference did not survive reload`);
    await page.locator('.themeToggle').click();

    const topicSelect = page.locator('#news select').first();
    if (await topicSelect.locator('option').count() > 1) {
      await topicSelect.selectOption({ index: 1 });
      assert(await page.locator('.news').count() > 0, `${viewport.name}: topic filter produced no cards`);
    }

    assert(runtimeErrors.length === 0, `${viewport.name}: runtime errors: ${runtimeErrors.join(' | ')}`);
    await page.screenshot({ path: new URL(`dashboard-${viewport.name}.png`, artifacts).pathname, fullPage: true });
    await page.close();
  }

  const pwaContext = await browser.newContext({ viewport: { width: 390, height: 844 }, colorScheme: 'dark' });
  const pwaPage = await pwaContext.newPage();
  await pwaPage.goto(baseURL, { waitUntil: 'networkidle' });
  await pwaPage.locator('.news').first().waitFor({ state: 'visible' });
  const pwa = await pwaPage.evaluate(async () => {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('service worker readiness timeout')), 8000)),
    ]);
    const manifest = await fetch('/manifest.webmanifest').then(response => response.json());
    return {
      controlled: Boolean(registration.active),
      display: manifest.display,
      startUrl: manifest.start_url,
      pngIcons: manifest.icons.filter(icon => icon.type === 'image/png').length,
      maskable: manifest.icons.some(icon => icon.purpose === 'maskable'),
    };
  });
  assert(pwa.controlled, 'PWA: service worker is not active');
  assert(pwa.display === 'standalone' && pwa.startUrl.startsWith('/'), 'PWA: manifest is not installable');
  assert(pwa.pngIcons >= 3 && pwa.maskable, 'PWA: required PNG and maskable icons are missing');
  await pwaContext.setOffline(true);
  await pwaPage.reload({ waitUntil: 'domcontentloaded' });
  assert(await pwaPage.locator('#root').count() === 1, 'PWA: cached app shell did not load offline');
  await pwaContext.setOffline(false);
  await pwaContext.close();

  console.log('Dashboard smoke passed: desktop/mobile, light/dark persistence, PWA installability/offline shell, navigation, filters, and overflow.');
} finally {
  if (browser) await browser.close();
  server.kill('SIGTERM');
}
