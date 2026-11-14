import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { chromium } from 'playwright';

const courseBytes = await fs.readFile('src/data/iasd-course.json');
const course = JSON.parse(courseBytes);
const visuals = JSON.parse(await fs.readFile('src/data/iasd-visuals.json', 'utf8'));
const base = process.env.IASD_BASE_URL || 'http://127.0.0.1:4325';
const storageKey = `hicall-iasd-studio-${course.version}`;
assert.equal(visuals.length, 16);
assert.deepEqual(visuals.map(item => item.lesson).sort((a, b) => a - b), course.lessons.map(item => item.n));
for (const field of ['title', 'description', 'cause', 'prompt']) assert.equal(new Set(visuals.map(item => item[field])).size, 16, `${field} must distinguish every session`);
for (const visual of visuals) {
  assert.ok(visual.edges.length >= 3 && visual.legend && visual.target);
  if (visual.type === 'matrix') for (const row of visual.rows) assert.equal(row.length, visual.headers.length);
  else assert.ok(visual.nodes.length >= 3);
}

const browser = await chromium.launch({ headless: true });
const report = { inventory: visuals.map(({ lesson, type, title, target }) => ({ lesson, type, title, target })), courseSHA256: createHash('sha256').update(courseBytes).digest('hex'), renders: [], focusChecks: [], errors: [] };
try {
  for (const width of [320, 390, 1440]) {
    const context = await browser.newContext({ viewport: { width, height: 900 }, serviceWorkers: 'block' });
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(error.message));
    page.setDefaultTimeout(7000);
    await page.goto(`${base}/iasd/studio#1`);
    await page.locator('[data-course-visual]').waitFor();
    for (const theme of ['light', 'dark']) {
      const dark = await page.locator('html').evaluate(el => el.classList.contains('dark'));
      if (dark !== (theme === 'dark')) await page.locator('[data-act="theme"]').click();
      for (const visual of visuals) {
        await page.evaluate(n => { location.hash = String(n); }, visual.lesson);
        const figure = page.locator(`[data-course-visual="iasd"][data-lesson-id="${visual.lesson}"]`);
        await figure.waitFor();
        assert.equal(await page.locator('[data-course-visual]').count(), 1);
        assert.equal(await figure.locator('h3').innerText(), visual.title);
        const names = await figure.evaluate(el => ({ label: document.getElementById(el.getAttribute('aria-labelledby'))?.textContent, descriptions: el.getAttribute('aria-describedby').split(' ').map(id => document.getElementById(id)?.textContent) }));
        assert.equal(names.label, visual.title);
        assert.ok(names.descriptions[0].includes(visual.description) && names.descriptions[1].includes(visual.cause));
        const summary = figure.locator('summary');
        await summary.focus();
        await page.keyboard.press('Enter');
        assert.ok(await figure.locator('details').evaluate(el => el.open));
        assert.deepEqual(await figure.locator('details li').allTextContents(), visual.edges);
        assert.ok(await summary.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none'));
        const appearance = await figure.evaluate(root => {
          const rgb = color => (color.match(/[\d.]+/g) || []).map(Number);
          const lum = color => rgb(color).slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
          return [...root.querySelectorAll('*')].filter(el => el.checkVisibility() && [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim())).flatMap(el => {
            const style = getComputedStyle(el); let ancestor = el, background = 'rgb(255,255,255)';
            while (ancestor) { const color = getComputedStyle(ancestor).backgroundColor; if (rgb(color)[3] !== 0) { background = color; break; } ancestor = ancestor.parentElement; }
            const a = lum(style.color), b = lum(background), ratio = (Math.max(a, b) + .05) / (Math.min(a, b) + .05);
            return ratio < 4.5 ? [{ text: el.textContent.slice(0, 50), ratio }] : [];
          });
        });
        assert.deepEqual(appearance, [], `${width}/${theme}/S${visual.lesson}: contrast`);
        const overflow = await figure.evaluate(root => ({ page: document.documentElement.scrollWidth - document.documentElement.clientWidth, elements: [...root.querySelectorAll('*')].filter(el => el.checkVisibility() && el.scrollWidth > el.clientWidth + 1).map(el => ({ tag: el.tagName, text: el.textContent.slice(0, 30), excess: el.scrollWidth - el.clientWidth })) }));
        assert.ok(overflow.page <= 1, `${width}/${theme}/S${visual.lesson}: page overflow ${JSON.stringify(overflow)}`);
        assert.deepEqual(overflow.elements, [], `${width}/${theme}/S${visual.lesson}: clipped content`);
        await page.keyboard.press('Tab');
        assert.ok(await figure.locator('button').evaluate(el => document.activeElement === el));
        await page.keyboard.press('Enter');
        const control = page.locator(`[data-setting="${visual.target}"]`);
        assert.ok(await control.isVisible());
        assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none'), `${width}/${theme}/S${visual.lesson}: simulator keyboard link`);
        await control.press('Tab');
        await page.keyboard.press('Shift+Tab');
        assert.ok(await control.evaluate(el => document.activeElement === el), `${width}/${theme}/S${visual.lesson}: keyboard return`);
        if (process.env.IASD_SCREENSHOT_DIR && [3, 4, 7, 10, 14, 16].includes(visual.lesson)) {
          await fs.mkdir(process.env.IASD_SCREENSHOT_DIR, { recursive: true });
          await figure.screenshot({ path: `${process.env.IASD_SCREENSHOT_DIR}/iasd-s${visual.lesson}-${width}-${theme}.png` });
        }
        report.renders.push({ width, theme, lesson: visual.lesson, labelled: true, equivalent: true, contrast: true, overflow: false, keyboardSimulatorLink: true });
      }
    }
    // Preserve learner records when only reading diagrams or following their simulator links.
    await page.locator('#tab-reflect').click();
    await page.locator('[data-note="0"]').fill('Bukti IASD: diagram dan simulator tidak menghapus catatan.');
    const before = await page.evaluate(key => localStorage.getItem(key), storageKey);
    await page.locator('#tab-concept').click();
    await page.locator('[data-act="visualtest"]').press('Enter');
    assert.equal(await page.evaluate(key => localStorage.getItem(key), storageKey), before);
    await page.reload();
    await page.locator('#tab-reflect').click();
    assert.equal(await page.locator('[data-note="0"]').inputValue(), 'Bukti IASD: diagram dan simulator tidak menghapus catatan.');
    await page.goto(`${base}/iasd/studio?mode=teach#4`);
    assert.ok(await page.locator('#pane-teach').isVisible());
    await page.locator('#tab-concept').click();
    // Keep the S04 assertion intact; collect focus/change evidence if it fails.
    await page.evaluate(() => {
      window.iasdFocusEvents = [];
      for (const type of ['focusin', 'change', 'keydown']) document.addEventListener(type, event => window.iasdFocusEvents.push({ type, key: event.key, setting: event.target.dataset?.setting, id: event.target.id, value: event.target.value, active: document.activeElement.id }));
    });
    for (let cycle = 0; cycle < 12; cycle++) {
      if (cycle % 2 === 0) await page.locator('[data-act="theme"]').click();
      await page.locator('[data-iasd-supplement="4"]').evaluate(el => { el.open = true; });
      for (const field of ['actor', 's4Stock', 's4Role', 's4Outcome']) {
        const control = page.locator(`[data-setting="${field}"]`);
        await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
        const actual = await control.evaluate(el => ({ focused: document.activeElement === el, active: document.activeElement.id, outline: getComputedStyle(el).outlineStyle, height: el.getBoundingClientRect().height }));
        if (!actual.focused || actual.outline === 'none' || actual.height < 44) report.focusFailure = { width, cycle, field, actual, events: await page.evaluate(() => window.iasdFocusEvents) };
        assert.ok(actual.focused && actual.outline !== 'none' && actual.height >= 44, `S04 ${width}/${cycle}/${field}: ${JSON.stringify(actual)}`);
        report.focusChecks.push({ width, cycle, field });
      }
    }
    await context.close();
  }
  assert.equal(report.renders.length, 96);
  assert.deepEqual(report.errors, []);
  console.log(JSON.stringify({ visualCount: visuals.length, renderedCases: report.renders.length, s04FocusChecks: report.focusChecks.length, pageErrors: report.errors, courseSHA256: report.courseSHA256 }));
} finally {
  if (process.env.IASD_VISUAL_REPORT) await fs.writeFile(process.env.IASD_VISUAL_REPORT, JSON.stringify(report, null, 2));
  await browser.close();
}
