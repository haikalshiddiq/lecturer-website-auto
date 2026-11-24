import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import net from 'node:net';
import { assertIasdKeyboardTarget, collectIasdFocusDiagnostic } from './test-iasd-focus-helpers.mjs';
import { runIasdSmoke } from './smoke-iasd.mjs';

let server;
let base = process.env.IASD_BASE_URL;
if (!base) {
  const port = await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', reject);
    probe.listen(0, '127.0.0.1', () => { const port = probe.address().port; probe.close(() => resolve(port)); });
  });
  base = `http://127.0.0.1:${port}`;
  server = spawn('npm', ['run', 'preview', '--', '--host', '127.0.0.1', '--port', String(port)], { detached: true, stdio: ['ignore', 'pipe', 'pipe'] });
  server.stdout.on('data', chunk => process.stdout.write(chunk));
  server.stderr.on('data', chunk => process.stderr.write(chunk));
}
function stopServer() {
  if (server?.pid) { try { process.kill(-server.pid, 'SIGTERM'); } catch { server.kill('SIGTERM'); } }
}
let browser;
const report = { cases: [], errors: [], negativeChecks: [] };
const legacy = process.env.IASD_FOCUS_GATE === 'legacy';
try {
  browser = await chromium.launch({ headless: true });
  let ready = false;
  for (let attempt = 0; attempt < 30; attempt++) {
    try { if ((await fetch(`${base}/iasd/studio`, { signal: AbortSignal.timeout(2000) })).ok) { ready = true; break; } } catch { /* The owned preview is still binding its port. */ }
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  assert.ok(ready, 'IASD focus test server did not become ready');
  if (process.argv.includes('--full')) {
    const widths = process.env.IASD_FOCUS_WIDTHS ? process.env.IASD_FOCUS_WIDTHS.split(',').map(Number) : [320, 390, 1440];
    for (const width of widths) {
      assert.ok([320, 390, 1440].includes(width), 'Supported focus widths: 320,390,1440');
      console.log(await runIasdSmoke(browser, base, { name: width === 1440 ? 'desktop' : `focus-${width}`, viewport: { width, height: 900 } }));
    }
  } else {
    for (const width of [320, 390, 1440]) {
      const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
      const page = await context.newPage();
      page.setDefaultTimeout(7000);
      page.on('pageerror', error => report.errors.push(error.message));
      await page.goto(`${base}/iasd/studio#1`);
      await page.locator('#sim-controls select').first().waitFor();
      for (const theme of ['light', 'dark']) {
        if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== (theme === 'dark')) await page.locator('[data-act="theme"]').click();
        for (const n of [3, 4, 5]) {
          await page.evaluate(n => { location.hash = String(n); }, n);
          await page.locator(`[data-iasd-supplement="${n}"]`).waitFor();
          await page.locator('#tab-reflect').click();
          await page.locator('[data-note="2"]').fill(`Focus regression S${n}`);
          await page.locator('#tab-teach').click();
          // Freeze the real appear animation, not an invented CSS transition.
          await page.evaluate(() => {
            document.querySelector('#tab-concept').click();
            window.iasdAppear = document.querySelector('#pane-concept').getAnimations()[0];
            window.iasdAppear.pause();
            window.iasdAppear.currentTime = 100;
          });
          await page.locator(`[data-iasd-supplement="${n}"]`).evaluate(el => { el.open = true; });
          if (n === 3) {
            await page.evaluate(() => window.iasdAppear.finish());
            continue;
          }
          for (const field of n === 4 ? ['actor', 's4Stock', 's4Role', 's4Outcome'] : ['s5Outcome']) {
            const control = page.locator(`[data-setting="${field}"]`);
            await page.evaluate(() => { window.iasdAppear.pause(); window.iasdAppear.currentTime = 100; });
            const node = await control.elementHandle();
            await control.focus();
            await page.keyboard.press('Tab');
            await page.keyboard.press('Shift+Tab');
            // The captured fractional appear frame exposes Chromium DOMRect quantization.
            await page.evaluate(() => { window.iasdAppear.currentTime = 0.2; });
            const during = await collectIasdFocusDiagnostic(control);
            assert.equal(await node.evaluate(el => el.isConnected), true, 'Tab traversal must not replace the control');
            await node.dispose();
            if (legacy) {
              assert.ok(during.focused && during.outline !== 'none' && during.height >= 44, `Legacy gate: ${JSON.stringify(during)}`);
              await page.evaluate(() => window.iasdAppear.finish());
            } else {
              const pending = assertIasdKeyboardTarget(page, control, `${width}/${theme}/S${n}/${field}`);
              await page.evaluate(() => window.iasdAppear.finish());
              const after = await pending;
              report.cases.push({ width, theme, lesson: n, field, during, after });
            }
          }
          if (n === 5) {
            for (const field of ['address', 'label']) {
              const control = page.locator(`[data-setting="${field}"]`);
              const before = await control.isChecked();
              await control.focus();
              await page.keyboard.press('Space');
              assert.equal(await control.isChecked(), !before, 'Space must toggle checkbox');
              await page.keyboard.press('Space');
              assert.equal(await control.isChecked(), before, 'Space must restore checkbox');
              assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.closest('label').getBoundingClientRect().height >= 44));
            }
          }
        }
      }
      if (width === 1440 && !legacy) {
        const control = page.locator('[data-setting="s5Outcome"]');
        await control.evaluate(el => { el.style.minHeight = '0'; el.style.height = '43px'; });
        await assert.rejects(assertIasdKeyboardTarget(page, control, 'undersized'), /44px tap target/);
        await control.evaluate(el => { el.style.minHeight = ''; el.style.height = ''; el.style.outline = 'none'; });
        await assert.rejects(assertIasdKeyboardTarget(page, control, 'outline absent'), /focus outline/);
        await control.evaluate(el => { el.style.outline = ''; });
        await page.evaluate(() => {
          window.iasdBlockReturn = event => { if (event.key === 'Tab' && event.shiftKey) event.preventDefault(); };
          document.addEventListener('keydown', window.iasdBlockReturn, true);
        });
        await assert.rejects(assertIasdKeyboardTarget(page, control, 'broken traversal'), /keyboard return/);
        await page.evaluate(() => document.removeEventListener('keydown', window.iasdBlockReturn, true));
        report.negativeChecks.push('43px rejected', 'missing outline rejected', 'broken Shift+Tab rejected');
      }
      await context.close();
    }
    if (!legacy) {
      assert.equal(report.cases.length, 30);
      assert.ok(report.cases.some(item => item.during.height < 44 && item.after.height >= 44), 'Must expose the original race, not merely pass a retry');
      assert.deepEqual(report.errors, []);
      console.log(JSON.stringify({ cases: report.cases.length, reproducedFrames: report.cases.filter(item => item.during.height < 44).length, negativeChecks: report.negativeChecks, pageErrors: report.errors }));
    }
  }
} finally {
  try {
    await fs.mkdir('output/playwright', { recursive: true });
    await fs.writeFile(`output/playwright/iasd-focus-${process.argv.includes('--full') ? 'full-' : ''}${legacy ? 'legacy' : 'repaired'}-results.json`, JSON.stringify(report, null, 2));
  } finally {
    try { await browser?.close(); } finally { stopServer(); }
  }
}
