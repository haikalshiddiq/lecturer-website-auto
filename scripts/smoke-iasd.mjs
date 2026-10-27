import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const course = JSON.parse(await fs.readFile('src/data/iasd-course.json', 'utf8'));
const key = `hicall-iasd-studio-${course.version}`;

export async function runIasdSmoke(browser, baseUrl, profile) {
  const context = await browser.newContext({ viewport: profile.viewport, acceptDownloads: true });
  const page = await context.newPage();
  page.setDefaultTimeout(7000);
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  const results = [];
  const tab = async name => { await page.locator(`#tab-${name}`).click(); assert.ok(await page.locator(`#pane-${name}`).isVisible()); };
  const checkOverflow = async label => assert.ok(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth) <= 1, `${profile.name} IASD overflow: ${label}`);
  const session = async n => {
    await page.evaluate(value => { location.hash = String(value); }, n);
    await page.waitForFunction(title => document.querySelector('#main h1')?.textContent === title, course.lessons[n - 1].title);
    await tab('concept');
  };
  const select = (name, value) => page.locator(`select[data-setting="${name}"]`).selectOption(value);
  const check = (name, value = true) => page.locator(`input[data-setting="${name}"]`).setChecked(value);
  const range = (name, value) => page.locator(`input[data-setting="${name}"]`).evaluate((el, number) => { el.value = String(number); el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })); }, value);
  const action = (name, value) => page.locator(`[data-simact="${name}"]${value ? `[data-value="${value}"]` : ''}`).click();
  const feedback = async text => assert.ok((await page.locator('#sim-viz').innerText()).includes(text), `Simulator feedback lacks ${text}`);
  const simulator = async n => {
    switch (n) {
      case 1:
        await select('change', 'stabil'); await feedback('relatif stabil');
        for (const change of ['sering', 'stabil']) for (const access of ['ada', 'sulit']) {
          await select('change', change); await select('access', access);
          const expected = access === 'sulit' ? 'klarifikasi' : change === 'sering' ? 'iterasi' : 'bertahap';
          for (const decision of ['iterasi', 'bertahap', 'klarifikasi']) {
            await select('s1Decision', decision);
            assert.ok(await page.locator('[data-iasd-prediction]').isVisible(), 'Changed prediction must invalidate previous feedback');
            await page.locator('[data-simact="s1review"]').focus();
            await page.locator('[data-simact="s1review"]').press('Enter');
            await feedback(decision === expected ? 'Tepat untuk asumsi latihan.' : 'Tinjau alasan pilihan.');
          }
        }
        await page.locator('[data-iasd-supplement="1"] summary').focus();
        await page.locator('[data-iasd-supplement="1"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="1"]').innerText()).includes('stok buku dan rak'));
        await select('change', 'sering'); await select('access', 'ada'); await select('s1Decision', 'iterasi'); await action('s1review');
        await page.reload({ waitUntil: 'networkidle' });
        assert.equal(await page.locator('[data-setting="s1Decision"]').inputValue(), 'iterasi');
        await feedback('Tepat untuk asumsi latihan.');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="1"]').innerText()).includes('ruang rapat'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="1"] summary').click(); assert.ok((await page.locator('[data-iasd-facilitation="1"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept');
        break;
      case 2:
        await select('category', 'kebutuhan'); await action('classify'); await feedback('Tepat.');
        await select('quote', '1');
        assert.ok(!(await page.locator('#sim-viz .feedback').count()), 'Changed quote must invalidate classification feedback');
        await action('classify'); await feedback('Tinjau kembali.');
        await select('category', 'asumsi'); await action('classify'); await feedback('Tepat.');
        for (const [quote, expected] of ['kebutuhan', 'asumsi', 'fakta', 'pertanyaan'].entries()) {
          await select('quote', String(quote));
          for (const category of ['fakta', 'asumsi', 'kebutuhan', 'pertanyaan']) {
            await select('category', category); await action('classify');
            await feedback(category === expected ? 'Tepat.' : 'Tinjau kembali.');
          }
        }
        await page.locator('[data-iasd-elicitation] summary').focus();
        await page.locator('[data-iasd-elicitation] summary').press('Enter');
        for (const stock of ['1', '3']) for (const approval of ['belum', 'sudah']) {
          await select('s2Stock', stock); await select('s2Approval', approval);
          await select('s2Limit', approval === 'belum' ? '2' : '5');
          for (const outcome of ['tolak', 'reservasi']) for (const status of ['usulan', 'disepakati']) {
            await select('s2Outcome', outcome); await select('s2Status', status);
            await page.locator('[data-simact="s2review"]').focus();
            await page.locator('[data-simact="s2review"]').press('Enter');
            const correct = outcome === (stock === '1' ? 'tolak' : 'reservasi') && status === (approval === 'belum' ? 'usulan' : 'disepakati');
            await feedback(correct ? 'Kedua prediksi tepat.' : 'Ada prediksi yang perlu direvisi.');
            await feedback(stock === '1' ? 'tidak membuat reservasi' : 'mencatat reservasi dua');
          }
        }
        await select('s2Limit', '2');
        assert.ok(await page.locator('[data-iasd-s2-prediction]').isVisible(), 'Changed SLA must invalidate checked prediction');
        await action('s2review'); await feedback('belum memenuhi batas');
        await select('s2Limit', '5'); await action('s2review'); await feedback('memenuhi batas');
        await page.reload({ waitUntil: 'networkidle' });
        await feedback('memenuhi batas');
        assert.equal(await page.locator('[data-setting="s2Limit"]').inputValue(), '5');
        await page.locator('[data-iasd-supplement="2"] summary').click();
        assert.ok((await page.locator('[data-iasd-supplement="2"]').innerText()).includes('FR01-v0'));
        await checkOverflow('session 2 expanded example');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="2"]').innerText()).includes('peminjaman proyektor'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="2"] summary').click();
        assert.ok((await page.locator('[data-iasd-facilitation="2"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-elicitation]').evaluate(el => { el.open = true; });
          const appearance = await page.evaluate(() => {
            const rgb = value => (value.match(/[\d.]+/g) || []).map(Number);
            const luminance = color => rgb(color).slice(0, 3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4; }).reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i], 0);
            const failures = [];
            const nodes = document.querySelectorAll('[data-iasd-supplement="2"] *, [data-iasd-elicitation] *, #sim-viz .feedback *');
            for (const el of nodes) {
              if (!el.checkVisibility() || ![...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim()) || el.tagName === 'OPTION') continue;
              const style = getComputedStyle(el); let ancestor = el, bg;
              while (ancestor) { const color = getComputedStyle(ancestor).backgroundColor; if (rgb(color)[3] !== 0) { bg = color; break; } ancestor = ancestor.parentElement; }
              const a = luminance(style.color), b = luminance(bg || 'rgb(255,255,255)'), ratio = (Math.max(a,b)+.05)/(Math.min(a,b)+.05);
              const size = parseFloat(style.fontSize), large = size >= 24 || (size >= 18.66 && Number(style.fontWeight) >= 700);
              if (ratio < (large ? 3 : 4.5)) failures.push({ text: el.textContent.slice(0, 40), ratio });
            }
            return failures;
          });
          assert.deepEqual(appearance, [], `S02 contrast failed in ${dark ? 'dark' : 'light'} mode`);
          for (const field of ['s2Stock', 's2Approval', 's2Limit', 's2Outcome', 's2Status']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), `S02 focus/tap target: ${field}`);
          }
          await checkOverflow(`S02 expanded ${dark ? 'dark' : 'light'}`);
        }
        break;
      case 3:
        await select('join', 'parallel'); for (let i = 0; i < 4; i++) await action('token'); await feedback('MACET');
        await select('join', 'exclusive'); await action('token'); await feedback('mencapai akhir');
        for (const stock of ['cukup', 'kurang']) for (const join of ['exclusive', 'parallel']) {
          await select('stock', stock); await select('join', join);
          for (const prediction of ['akhir', 'tunggu']) {
            await select('s3Outcome', prediction);
            await page.locator('[data-simact="s3review"]').focus();
            await page.locator('[data-simact="s3review"]').press('Enter');
            await feedback(prediction === (join === 'parallel' ? 'tunggu' : 'akhir') ? 'Prediksi tepat.' : 'Prediksi perlu direvisi.');
            await feedback(stock === 'cukup' ? 'Reservasi: satu token' : 'Beri tahu: satu token');
            await feedback(join === 'parallel' ? 'tidak pernah diaktifkan' : 'Tidak menunggu cabang lain');
          }
        }
        await select('stock', 'cukup');
        assert.ok(await page.locator('[data-iasd-s3-prediction]').isVisible(), 'Changed stock must invalidate BPMN prediction');
        await select('s3Outcome', 'tunggu'); await action('s3review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Prediksi tepat.');
        await page.locator('[data-iasd-supplement="3"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="3"]').innerText()).includes('jejak A'));
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="3"]').innerText()).includes('perpustakaan'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="3"] summary').click();
        assert.ok((await page.locator('[data-iasd-facilitation="3"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          const control = page.locator('[data-setting="s3Outcome"]'); await control.focus();
          await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
          assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), 'S03 focus/tap target');
          await checkOverflow(`S03 expanded ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="3"] *, #control-s3Outcome, #sim-viz .feedback *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S03 scanned text must meet AA in both themes');
        }
        break;
      case 4:
        await select('actor', 'Database internal'); await feedback('bukan aktor');
        for (const actor of ['Pelanggan', 'Penyedia bayar', 'Database internal']) for (const stock of ['1', '3']) {
          await select('actor', actor); await select('s4Stock', stock);
          for (const role of ['eksternal', 'internal']) for (const outcome of ['tolak', 'reservasi', 'lunas']) {
            await select('s4Role', role); await select('s4Outcome', outcome);
            await page.locator('[data-simact="s4review"]').press('Enter');
            const correct = role === (actor === 'Database internal' ? 'internal' : 'eksternal') && outcome === (stock === '1' ? 'tolak' : 'reservasi');
            await feedback(correct ? 'Kedua prediksi tepat.' : 'Revisi prediksi dengan kontrak.');
            await feedback(stock === '1' ? 'tanpa reservasi baru' : 'reservasi dua unit');
            await feedback('belum membuktikan pembayaran berhasil');
          }
        }
        await select('s4Stock', '1');
        assert.ok(await page.locator('[data-iasd-s4-prediction]').isVisible(), 'Stock change must invalidate S04 feedback');
        await select('s4Role', 'internal'); await select('s4Outcome', 'tolak'); await action('s4review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Kedua prediksi tepat.');
        assert.equal(await page.locator('[data-setting="s4Stock"]').inputValue(), '1');
        const example4 = page.locator('[data-iasd-supplement="4"] summary'); await example4.press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="4"]').innerText()).includes('UC01-A'));
        await example4.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="4"]').getAttribute('open'), null); await example4.press('Enter');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="4"]').innerText()).includes('peminjaman kamera'));
        await page.locator('[data-note="2"]').fill('Transfer kamera: boundary aplikasi; stok satu menolak dua; stok tiga reservasi dua; pembayaran belum terbukti.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect');
        assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer kamera'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="4"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-facilitation="4"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-supplement="4"]').evaluate(el => { el.open = true; });
          for (const field of ['actor', 's4Stock', 's4Role', 's4Outcome']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), `S04 keyboard/tap target ${field}`);
          }
          await checkOverflow(`S04 expanded ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="4"] *, #sim-controls label, #sim-controls select, #sim-viz .feedback *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S04 scanned text must meet AA in both themes');
        }
        break;
      case 5: await select('join', 'merge'); await check('address'); await feedback('terlalu dini'); break;
      case 6: await action('pay'); await action('pay'); await select('mode', 'baru'); await feedback('efek ganda'); break;
      case 7: await range('qty', 0); await feedback('melanggar'); await check('draft'); await feedback('Draft boleh kosong'); break;
      case 8: await range('booked', 2); await feedback('melebihi kapasitas'); break;
      case 9: await check('missing'); await feedback('Tidak seimbang'); break;
      case 10: await check('snapshot', false); await feedback('Nilai lama ikut harga baru'); break;
      case 11: await action('event', 'submit'); await action('event', 'timeout'); await action('event', 'pay'); await feedback('ditolak dari Cancelled'); break;
      case 12: await select('owner', 'UI'); await feedback('tidak boleh'); break;
      case 13: await check('available', false); await action('screen', 'Checkout'); await action('checkout'); await feedback('Stok Berubah'); break;
      case 14: case 15: await select('change', 'warna'); await check('impact3'); await check('impact5'); await action('impact'); await feedback('Acuan kasus: UI, Test'); break;
      case 16: await check('cross', false); await feedback('Belum cukup'); await check('cross', true); await feedback('Jumlah cukup'); break;
    }
  };
  const downloadText = async locator => {
    const pending = page.waitForEvent('download'); await locator.click();
    const download = await pending;
    const result = { name: download.suggestedFilename(), text: await fs.readFile(await download.path(), 'utf8') };
    // Chromium throttles rapid bursts of downloads; model deliberate user clicks.
    await page.waitForTimeout(200);
    return result;
  };
  const tool = async name => { await page.locator('.tools-menu summary').click(); return page.locator(`[data-act="${name}"]`); };
  try {
    await page.goto(`${baseUrl}/iasd`, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('[data-iasd-overview]').isVisible());
    assert.equal(await page.locator('#iasd-session option').count(), 16);
    await checkOverflow('overview');
    await page.locator('[data-iasd-supplement-entry] a[href="/iasd/studio#4"]').click();
    await page.waitForFunction(() => document.querySelector('#main h1')?.textContent === 'Use case dan skenario');
    assert.ok(await page.locator('[data-setting="s4Stock"]').isVisible());
    await page.goto(`${baseUrl}/iasd/studio#1`, { waitUntil: 'networkidle' });
    await page.locator('#sim-controls select').first().waitFor();
    assert.equal(await page.locator('#session-select option').count(), 16);
    for (const lesson of course.lessons) {
      await session(lesson.n);
      assert.equal(await page.locator('.concept-grid .concept').count(), 3);
      assert.ok(await page.locator(lesson.sim === 'prototype' ? '#sim-viz .screen' : '#sim-viz svg').isVisible(), `Session ${lesson.n} visual missing`);
      await simulator(lesson.n);
      await checkOverflow(`session ${lesson.n} visual`);
      await tab('lab'); assert.equal(await page.locator('[data-step]').count(), 8);
      await tab('reflect'); assert.equal(await page.locator('[data-note]').count(), 3);
      for (const [index, quiz] of lesson.quiz.entries()) await page.locator(`[data-question="${index}"][value="${quiz.answer}"]`).check();
      await page.locator('[data-act="grade"]').click();
      assert.ok((await page.locator('#grade-result').innerText()).includes('3 dari 3'));
      assert.equal(await page.locator('.question-feedback.correct').count(), 3);
      assert.equal(await page.locator('[data-iasd-transfer]').count(), [1, 2, 3, 4].includes(lesson.n) ? 1 : 0, 'Supplement leaked to another session or vanished on grading');
      await tab('teach'); assert.ok((await page.locator('#pane-teach').innerText()).includes(lesson.hook));
      await tab('sources'); assert.equal(await page.locator('#pane-sources > ol.source-list > li').count(), lesson.refs.length);
      await checkOverflow(`session ${lesson.n} sources`);
      results.push({ session: lesson.n, visual: true, simulator: true, questions: 3, tabs: 5 });
    }
    assert.equal(results.length, 16);
    await session(1);
    await tab('reflect');
    await page.locator('[data-act="complete"]').click();
    assert.ok((await page.locator('#toast').innerText()).includes('Belum lengkap'));
    for (let i = 0; i < 3; i++) await page.locator(`[data-note="${i}"]`).fill(`Bukti individu ${i}: input, keputusan dan verifikasi telah dijelaskan dengan data kasus.`);
    await tab('lab'); for (let i = 0; i < 6; i++) await page.locator(`[data-step="${i}"]`).check();
    await tab('reflect'); await page.locator('[data-act="complete"]').click();
    assert.ok((await page.locator('#completion-status').innerText()).includes('Selesai'));
    await page.reload({ waitUntil: 'networkidle' }); await tab('reflect');
    assert.ok((await page.locator('[data-note="0"]').inputValue()).includes('Bukti individu 0'));
    const saved = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    assert.ok(saved.lessons[1].complete && saved.lessons[1].checked);
    const backup = await downloadText(await tool('export'));
    assert.equal(JSON.parse(backup.text).lessons[1].notes[0], saved.lessons[1].notes[0]);
    await page.setInputFiles('#import-file', { name: 'wrong-course.json', mimeType: 'application/json', buffer: Buffer.from('{"course":"OTHER","version":"bad","lessons":{}}') });
    assert.ok((await page.locator('#toast').innerText()).includes('Tidak dipulihkan'));
    const legacy = JSON.parse(backup.text);
    for (const record of Object.values(legacy.lessons)) for (const field of Object.keys(record.sim)) if (/^s[1234]/.test(field)) delete record.sim[field];
    page.once('dialog', dialog => dialog.accept());
    await page.setInputFiles('#import-file', { name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy)) });
    await page.waitForFunction(() => document.querySelector('#toast')?.textContent.includes('Cadangan dipulihkan'));
    await session(4); assert.equal(await page.locator('[data-setting="s4Stock"]').inputValue(), '1');
    assert.ok(await page.locator('[data-iasd-s4-prediction]').isVisible(), 'Legacy backup must start S04 unreviewed without losing notes');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[4].notes[2].includes('Transfer kamera'));
    await session(2); assert.equal(await page.locator('[data-setting="s2Stock"]').inputValue(), '1');
    const restoredLegacy = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    assert.deepEqual(restoredLegacy.lessons[1].notes, saved.lessons[1].notes);
    page.once('dialog', dialog => dialog.accept());
    await page.setInputFiles('#import-file', { name: 'restored.json', mimeType: 'application/json', buffer: Buffer.from(backup.text) });
    await page.waitForFunction(() => document.querySelector('#toast')?.textContent.includes('Cadangan dipulihkan'));
    await session(4); await feedback('Kedua prediksi tepat.');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[4].notes[2].includes('Transfer kamera'));
    await session(1);
    await tab('lab'); await page.locator('.materials summary').click();
    assert.equal(await page.locator('[data-file]').count(), 13);
    if (profile.name === 'desktop') for (const [name, text] of Object.entries(course.files)) {
      console.log(`IASD download check: ${name}`);
      const asset = await downloadText(page.locator(`[data-file="${name}"]`)); assert.equal(asset.name, name); assert.equal(asset.text, text);
    }
    await tab('reflect'); const worksheet = await downloadText(page.locator('[data-act="worksheet"]'));
    assert.ok(worksheet.text.includes(saved.lessons[1].notes[0]));
    const csv = await downloadText(await tool('report')); assert.ok(csv.text.includes('LATIHAN_MANDIRI_BUKAN_NILAI_RESMI'));
    await tab('concept'); const svg = await downloadText(page.locator('[data-act="svg"]')); assert.ok(svg.text.includes('<svg'));
    await page.locator('[data-act="focus"]').click(); assert.ok(await page.locator('body').evaluate(el => el.classList.contains('fullfocus')));
    await page.locator('[data-act="focus"]').click();
    await page.locator('[data-act="theme"]').click();
    const theme = await page.locator('html').getAttribute('data-theme');
    await page.reload({ waitUntil: 'networkidle' }); assert.equal(await page.locator('html').getAttribute('data-theme'), theme);
    await page.screenshot({ path: `output/playwright/iasd-${profile.name}.png`, fullPage: true });
    await page.goto(`${baseUrl}/iasd/studio?mode=teach#4`, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('#pane-teach').isVisible());
    await page.locator('[data-iasd-facilitation="4"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-facilitation="4"]').innerText()).includes('Prediksi:'));
    assert.ok(await page.locator('#pane-teach').isVisible());
    await page.locator('#tab-teach').press('ArrowLeft'); assert.ok(await page.locator('#pane-reflect').isVisible());
    await page.evaluate(() => navigator.serviceWorker.ready);
    await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
    // Warm the normalized studio route before switching the browser offline.
    await page.goto(`${baseUrl}/iasd/studio#3`, { waitUntil: 'networkidle' });
    await context.setOffline(true);
    await page.reload({ waitUntil: 'networkidle' });
    assert.ok(await page.locator('#sim-viz svg').isVisible());
    await select('join', 'parallel'); for (let i = 0; i < 4; i++) await action('token'); await feedback('MACET');
    await select('s3Outcome', 'tunggu'); await action('s3review'); await feedback('Prediksi tepat.');
    await session(1); await select('access', 'sulit'); await select('s1Decision', 'klarifikasi'); await action('s1review'); await feedback('Tepat untuk asumsi latihan.');
    await session(2); if (await page.locator('[data-iasd-elicitation]').getAttribute('open') === null) await page.locator('[data-iasd-elicitation] summary').click();
    await select('s2Stock', '1'); await select('s2Approval', 'belum'); await select('s2Outcome', 'tolak'); await select('s2Status', 'usulan'); await action('s2review'); await feedback('Kedua prediksi tepat.');
    await session(4); await select('actor', 'Pelanggan'); await select('s4Stock', '3'); await select('s4Role', 'eksternal'); await select('s4Outcome', 'reservasi'); await action('s4review'); await feedback('Kedua prediksi tepat.');
    await page.locator('[data-iasd-supplement="4"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="4"]').innerText()).includes('UC01-A'));
    await page.screenshot({ path: `output/playwright/iasd-s04-${profile.name}.png`, fullPage: true });
    assert.equal(errors.length, 0, `IASD browser errors: ${errors.join(' | ')}`);
    await fs.writeFile(`output/playwright/iasd-${profile.name}-results.json`, JSON.stringify(results, null, 2));
    return `${profile.name}: IASD 16 sessions, 48 quiz answers, simulators, lecturer tabs, persistence, backup, downloads and offline PASS`;
  } finally { await context.close(); }
}
