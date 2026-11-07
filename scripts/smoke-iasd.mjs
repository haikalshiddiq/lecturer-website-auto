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
      case 5:
        for (const join of ['join', 'merge']) for (const address of [false, true]) for (const label of [false, true]) {
          await select('join', join); await check('address', address); await check('label', label);
          const released = join === 'join' ? address && label : address || label;
          const expected = !released ? 'tunggu' : address && label ? 'sah' : 'dini';
          for (const prediction of ['tunggu', 'sah', 'dini']) {
            await select('s5Outcome', prediction);
            await page.locator('[data-simact="s5review"]').press('Enter');
            await feedback(prediction === expected ? 'Prediksi dan alasan cocok.' : 'Pisahkan aliran dari izin bisnis.');
            await feedback(!released ? 'Tidak ada token keluar' : address && label ? 'kedua prasyarat terpenuhi' : 'satu prasyarat belum selesai');
          }
        }
        await select('join', 'merge'); await check('address', true); await check('label', false);
        await select('s5Outcome', 'dini'); await action('s5review'); await feedback('Prediksi dan alasan cocok.');
        await check('label', true); assert.ok(await page.locator('[data-iasd-s5-prediction]').isVisible(), 'Task change must invalidate S05 prediction');
        await check('label', false); await action('s5review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Prediksi dan alasan cocok.');
        const example5 = page.locator('[data-iasd-supplement="5"] summary'); await example5.press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="5"]').innerText()).includes('bypass'));
        await example5.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="5"]').getAttribute('open'), null); await example5.press('Enter');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="5"]').innerText()).includes('sertifikat'));
        await page.locator('[data-note="2"]').fill('Transfer sertifikat: pembayaran dan identitas wajib; bypass menghasilkan token selesai tanpa validasi ulang.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer sertifikat'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="5"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-facilitation="5"]').innerText()).includes('Rubrik diagnostik')); await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-supplement="5"]').evaluate(el => { el.open = true; });
          const prediction = page.locator('[data-setting="s5Outcome"]'); await prediction.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
          assert.ok(await prediction.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), 'S05 keyboard/tap target');
          for (const field of ['address', 'label']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await control.press('Space'); await control.press('Space');
            assert.ok(await control.evaluate(el => el.closest('label').getBoundingClientRect().height >= 44), `S05 checkbox target ${field}`);
          }
          await checkOverflow(`S05 ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="5"] *, #sim-controls label, #sim-controls select, #sim-viz .feedback *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S05 scanned text AA');
        }
        break;
      case 6:
        await action('pay'); await action('pay'); await select('mode', 'baru'); await feedback('efek ganda');
        await page.locator('[data-iasd-recovery] summary').press('Enter');
        for (const status of ['unknown', 'paid', 'rejected']) for (const identity of ['match', 'mismatch']) {
          await select('s6Status', status); await select('s6Identity', identity);
          const expected = identity === 'mismatch' ? 'review' : status === 'unknown' ? 'query' : status === 'paid' ? 'record' : 'review';
          for (const decision of ['query', 'record', 'review']) {
            await select('s6Decision', decision); await page.locator('[data-simact="s6review"]').press('Enter');
            await feedback(decision === expected ? 'Keputusan sesuai bukti.' : 'Revisi tindakan, bukan riwayat.');
            await feedback(identity === 'mismatch' ? 'Identitas tidak cocok' : status === 'unknown' ? 'Belum ada hasil otoritatif' : status === 'paid' ? 'Tercatat berhasil untuk O-AR1/K-AR1' : 'Penolakan terkonfirmasi untuk O-AR1/K-AR1');
          }
        }
        await select('s6Status', 'paid'); await select('s6Identity', 'match'); await select('s6Decision', 'record'); await action('s6review');
        await select('s6Status', 'unknown'); assert.ok(await page.locator('[data-iasd-s6-prediction]').isVisible(), 'S06 changed evidence invalidates feedback');
        await select('s6Status', 'paid'); await action('s6review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Keputusan sesuai bukti.');
        const example6 = page.locator('[data-iasd-supplement="6"] summary'); await example6.press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="6"]').innerText()).includes('K-AR1')); await example6.press('Escape'); await example6.press('Enter');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="6"]').innerText()).includes('tiket lokakarya'));
        await page.locator('[data-note="2"]').fill('Transfer tiket: callback sama bukan izin efek baru; cocokkan identitas dan hasil otoritatif.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer tiket'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="6"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-facilitation="6"]').innerText()).includes('Rubrik diagnostik')); await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-supplement="6"]').evaluate(el => { el.open = true; });
          for (const field of ['mode', 's6Status', 's6Identity', 's6Decision']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), `S06 focus/tap ${field}`);
          }
          await checkOverflow(`S06 ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="6"] *, [data-iasd-recovery] *, #sim-viz [data-iasd-s6-feedback] *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S06 scanned text AA');
        }
        break;
      case 7:
        await range('qty', 0); await feedback('melanggar'); await check('draft'); await feedback('Draft boleh kosong');
        await page.locator('[data-iasd-object-contract] summary').press('Enter');
        for (const draft of [false, true]) for (const qty of [0, 1, 4]) for (const event of ['save', 'submit']) {
          await check('draft', draft); await range('qty', qty); await select('s7Event', event);
          const expected = qty > 0 || (draft && event === 'save') ? 'allow' : 'reject';
          for (const decision of ['allow', 'reject']) for (const owner of ['Order', 'UI']) {
            await select('s7Decision', decision); await select('s7Owner', owner); await page.locator('[data-simact="s7review"]').press('Enter');
            await feedback(decision === expected && owner === 'Order' ? 'Kontrak dan owner tepat.' : 'Tinjau kontrak atau owner.');
            await feedback(expected === 'allow' ? 'Operasi diizinkan' : 'Operasi ditolak');
            await feedback('Order menjaga invariant');
          }
        }
        await check('draft', true); await range('qty', 0); await select('s7Event', 'submit'); await select('s7Decision', 'reject'); await select('s7Owner', 'Order'); await action('s7review');
        await select('s7Event', 'save'); assert.ok(await page.locator('[data-iasd-s7-prediction]').isVisible(), 'S07 event invalidates old feedback');
        await select('s7Event', 'submit'); await action('s7review');
        await range('qty', 1); assert.ok(await page.locator('[data-iasd-s7-prediction]').isVisible(), 'S07 quantity invalidates old feedback');
        await range('qty', 0); await action('s7review');
        await check('draft', false); assert.ok(await page.locator('[data-iasd-s7-prediction]').isVisible(), 'S07 policy invalidates old feedback');
        await check('draft', true); await action('s7review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Kontrak dan owner tepat.');
        const example7 = page.locator('[data-iasd-supplement="7"] summary'); await example7.press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="7"]').innerText()).includes('O-AR7')); await example7.press('Escape'); await example7.press('Enter');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="7"]').innerText()).includes('peminjaman alat'));
        await page.locator('[data-note="2"]').fill('Transfer peminjaman alat: draft kosong boleh disimpan, submit memerlukan baris; objek Permohonan menjaga invariant.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer peminjaman alat'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="7"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-facilitation="7"]').innerText()).includes('Rubrik diagnostik')); await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-supplement="7"]').evaluate(el => { el.open = true; });
          for (const field of ['s7Event', 's7Decision', 's7Owner']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), `S07 focus/tap ${field}`);
          }
          const draftControl = page.locator('[data-setting="draft"]'); await draftControl.focus(); await draftControl.press('Space'); await draftControl.press('Space');
          assert.ok(await draftControl.evaluate(el => el.closest('label').getBoundingClientRect().height >= 44), 'S07 draft touch label');
          const qtyControl = page.locator('[data-setting="qty"]'); await qtyControl.focus(); await qtyControl.press('ArrowLeft'); await qtyControl.press('ArrowRight');
          await checkOverflow(`S07 ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="7"] *, [data-iasd-object-contract] *, [data-iasd-s7-feedback] *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S07 scanned text AA');
        }
        await check('draft', true); await range('qty', 0); await select('s7Event', 'submit'); await select('s7Decision', 'reject'); await action('s7review');
        break;
      case 8:
        await range('booked', 2); await feedback('melebihi kapasitas');
        await page.locator('[data-iasd-slot-contract] summary').press('Enter');
        for (const capacity of [1, 2]) for (const booked of [0, 1, 2, 3]) for (const event of ['reserve', 'cancelActive', 'cancelClosed']) {
          await range('slotCapacity', capacity); await range('booked', booked); await select('s8Event', event);
          const expected = booked > capacity ? 'audit' : event === 'reserve' ? (booked < capacity ? 'allow' : 'reject') : event === 'cancelActive' && booked > 0 ? 'allow' : 'reject';
          for (const decision of ['allow', 'reject', 'audit']) {
            await select('s8Decision', decision); await page.locator('[data-simact="s8review"]').press('Enter');
            await feedback(decision === expected ? 'Jejak dan keputusan cocok.' : 'Revisi keputusan dari invariant.');
            await feedback('Slot menjaga kapasitas');
          }
        }
        await range('slotCapacity', 2); await range('booked', 1); await select('s8Event', 'reserve'); await select('s8Decision', 'allow'); await action('s8review');
        await range('booked', 2); assert.ok(await page.locator('[data-iasd-s8-prediction]').isVisible()); await range('booked', 1); await action('s8review');
        await range('slotCapacity', 1); assert.ok(await page.locator('[data-iasd-s8-prediction]').isVisible()); await range('slotCapacity', 2); await action('s8review');
        await select('s8Event', 'cancelClosed'); assert.ok(await page.locator('[data-iasd-s8-prediction]').isVisible()); await select('s8Event', 'reserve'); await action('s8review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Jejak dan keputusan cocok.');
        const example8 = page.locator('[data-iasd-supplement="8"] summary'); await example8.press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="8"]').innerText()).includes('FR-SLOT')); await example8.press('Escape'); await example8.press('Enter');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="8"]').innerText()).includes('ruang konsultasi'));
        await page.locator('[data-note="2"]').fill('Transfer ruang konsultasi: hitung reservasi aktif, batalkan identitas aktif sekali, telusuri FR-SLOT ke guard dan Slot.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer ruang konsultasi'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="8"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-facilitation="8"]').innerText()).includes('Rubrik diagnostik')); await tab('concept');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-supplement="8"]').evaluate(el => { el.open = true; });
          for (const field of ['s8Event', 's8Decision', 'slotCapacity', 'booked']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && el.getBoundingClientRect().height >= 44), `S08 focus/tap ${field}`);
          }
          await checkOverflow(`S08 ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="8"] *, [data-iasd-slot-contract] *, [data-iasd-s8-feedback] *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S08 scanned text AA');
        }
        break;
      case 9:
        await check('missing'); await feedback('Tidak seimbang');
        await page.locator('[data-iasd-data-contract] summary').press('Enter');
        for (const missing of [false, true]) for (const bypass of [false, true]) for (const payload of ['complete', 'idOnly']) {
          await check('missing', missing); await check('bypass', bypass); await select('s9Payload', payload);
          for (const boundary of ['yes', 'no']) for (const routing of ['yes', 'no']) {
            await select('s9Boundary', boundary); await select('s9Routing', routing); await page.locator('[data-simact="s9review"]').press('Enter');
            const correct = boundary === (!missing && payload === 'complete' ? 'yes' : 'no') && routing === (bypass ? 'no' : 'yes');
            await feedback(correct ? 'Dua audit tepat.' : 'Pisahkan dua audit.');
            await feedback(missing ? 'Konfirmasi tidak keluar' : payload === 'idOnly' ? 'status_hasil hilang' : 'Kontrak eksternal terwakili');
            await feedback(bypass ? 'Pelanggan langsung ke D1' : 'Akses D1 melalui proses');
          }
        }
        await check('missing', false); await check('bypass', false); await select('s9Payload', 'idOnly'); await select('s9Boundary', 'no'); await select('s9Routing', 'yes'); await action('s9review');
        await select('s9Payload', 'complete'); assert.ok(await page.locator('[data-iasd-s9-prediction]').isVisible());
        await select('s9Payload', 'idOnly'); await action('s9review');
        await check('missing', true); assert.ok(await page.locator('[data-iasd-s9-prediction]').isVisible()); await check('missing', false); await action('s9review');
        await check('bypass', true); assert.ok(await page.locator('[data-iasd-s9-prediction]').isVisible()); await check('bypass', false); await action('s9review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Dua audit tepat.');
        await page.locator('[data-iasd-supplement="9"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="9"]').innerText()).includes('status_hasil'));
        await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="9"]').getAttribute('open'), null);
        await page.locator('[data-iasd-supplement="9"] summary').press('Enter');
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="9"]').innerText()).includes('peminjaman alat'));
        await page.locator('[data-note="2"]').fill('Transfer peminjaman alat: kontrak, dua audit, perubahan retur dan batas bukti.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer peminjaman alat'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="9"] summary').press('Enter'); assert.ok((await page.locator('[data-iasd-facilitation="9"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept'); await page.locator('[data-iasd-supplement="9"] summary').press('Enter');
        for (const dark of [false, true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          await page.locator('[data-iasd-data-contract]').evaluate(el => { el.open = true; });
          for (const field of ['s9Payload', 's9Boundary', 's9Routing', 'missing', 'bypass']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && (el.type === 'checkbox' ? el.closest('label') : el).getBoundingClientRect().height >= 44), `S09 focus/tap target: ${field}`);
          }
          await checkOverflow(`S09 expanded ${dark ? 'dark' : 'light'}`);
          assert.deepEqual(await page.evaluate(() => {
            const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
            const lum = c => rgb(c).slice(0,3).map(v => { v /= 255; return v <= .04045 ? v / 12.92 : ((v+.055)/1.055)**2.4; }).reduce((s,v,i) => s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="9"] *, [data-iasd-data-contract] *, [data-iasd-s9-feedback] *')].filter(el => el.checkVisibility() && el.tagName !== 'OPTION' && [...el.childNodes].some(n => n.nodeType===3 && n.textContent.trim())).flatMap(el => {
              const style=getComputedStyle(el); let ancestor=el, bg='rgb(255,255,255)';
              while(ancestor) { const color=getComputedStyle(ancestor).backgroundColor; if(rgb(color)[3]!==0){bg=color;break;} ancestor=ancestor.parentElement; }
              const a=lum(style.color),b=lum(bg),ratio=(Math.max(a,b)+.05)/(Math.min(a,b)+.05),size=parseFloat(style.fontSize),large=size>=24 || (size>=18.66 && Number(style.fontWeight)>=700);
              return ratio < (large?3:4.5) ? [{text:el.textContent.slice(0,40),ratio}] : [];
            });
          }), [], 'S09 scanned text must meet AA in both themes');
        }
        break;
      case 10:
        await check('snapshot', false); await feedback('Nilai lama ikut harga baru');
        await page.locator('[data-iasd-price-contract] summary').press('Enter');
        for (const price of [50, 100, 150, 300]) for (const snapshot of [false, true]) for (const discount of ['locked', 'live']) for (const parent of ['exists', 'missing']) {
          await range('price', price); await check('snapshot', snapshot); await select('s10Discount', discount); await select('s10Parent', parent);
          for (const history of ['yes', 'no']) for (const row of ['allow', 'reject']) {
            await select('s10History', history); await select('s10Row', row); await page.locator('[data-simact="s10review"]').press('Enter');
            const correct = history === (snapshot && discount === 'locked' ? 'yes' : 'no') && row === (parent === 'exists' ? 'allow' : 'reject');
            await feedback(correct ? 'Dua alasan tepat.' : 'Pisahkan histori dan integritas.');
            const total = 2 * ((snapshot ? 100 : price) - (discount === 'locked' ? 10 : 20));
            assert.ok((await page.locator('[data-iasd-s10-ledger]').innerText()).includes(String(total)), 'Discount arithmetic must match the snapshot');
            await feedback(parent === 'missing' ? 'Order O-10 tidak ditemukan' : 'Order O-10 dan Product P-10 ada');
          }
        }
        await check('snapshot', true); await select('s10Discount', 'locked'); await select('s10Parent', 'missing'); await select('s10History', 'yes'); await select('s10Row', 'reject'); await action('s10review');
        for (const [field, value, restore] of [['s10Discount','live','locked'],['s10Parent','exists','missing']]) {
          await select(field,value); assert.ok(await page.locator('[data-iasd-s10-prediction]').isVisible()); await select(field,restore); await action('s10review');
        }
        await check('snapshot', false); assert.ok(await page.locator('[data-iasd-s10-prediction]').isVisible()); await check('snapshot', true); await action('s10review');
        await range('price', 150); assert.ok(await page.locator('[data-iasd-s10-prediction]').isVisible()); await action('s10review');
        await page.reload({ waitUntil: 'networkidle' }); await feedback('Dua alasan tepat.');
        await page.locator('[data-iasd-supplement="10"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="10"]').innerText()).includes('OI-10'));
        await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="10"]').getAttribute('open'), null);
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="10"]').innerText()).includes('pemesanan buku'));
        await page.locator('[data-note="2"]').fill('Transfer pemesanan buku: harga dan diskon dikunci, FK diperiksa terpisah, draft bukan submitted.');
        await page.reload({ waitUntil: 'networkidle' }); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer pemesanan buku'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="10"] summary').press('Enter'); assert.ok((await page.locator('[data-iasd-facilitation="10"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept'); await page.locator('[data-iasd-supplement="10"] summary').press('Enter');
        for (const dark of [false,true]) {
          if ((await page.locator('html').evaluate(el => el.classList.contains('dark'))) !== dark) await page.locator('[data-act="theme"]').click();
          for (const field of ['price','snapshot','s10Discount','s10Parent','s10History','s10Row']) {
            const control = page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el => document.activeElement === el && getComputedStyle(el).outlineStyle !== 'none' && (el.type==='checkbox'?el.closest('label'):el).getBoundingClientRect().height >= 44), `S10 focus/tap: ${field}`);
          }
          await checkOverflow('S10 expanded both themes');
          assert.deepEqual(await page.evaluate(() => {
            const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number),lum=c=>rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="10"] *, [data-iasd-price-contract] *, [data-iasd-s10-feedback] *, [data-iasd-s10-ledger] *')].filter(el=>el.checkVisibility()&&el.tagName!=='OPTION'&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(el=>{
              const st=getComputedStyle(el);let a=el,bg='rgb(255,255,255)';while(a){const c=getComputedStyle(a).backgroundColor;if(rgb(c)[3]!==0){bg=c;break;}a=a.parentElement;}
              const x=lum(st.color),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05),large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
              return ratio<(large?3:4.5)?[{text:el.textContent.slice(0,40),ratio}]:[];
            });
          }), [], 'S10 scanned text AA');
        }
        break;
      case 11:
        await action('event', 'submit'); await action('event', 'timeout'); await action('event', 'pay'); await feedback('ditolak dari Cancelled');
        await page.locator('[data-iasd-lifecycle-contract] summary').press('Enter');
        for (const trace of ['normal','late','duplicate','unverified']) for (const state of ['Draft','AwaitingPayment','Paid','Cancelled']) for (const follow of ['record','reconcile','verify']) {
          await select('s11Trace',trace); await select('s11State',state); await select('s11Follow',follow);
          await page.locator('[data-simact="s11review"]').press('Enter');
          const correct=state===({normal:'Paid',late:'Cancelled',duplicate:'Paid',unverified:'AwaitingPayment'}[trace])&&follow===({normal:'record',late:'reconcile',duplicate:'record',unverified:'verify'}[trace]);
          await feedback(correct?'Lifecycle dan tindak lanjut tepat.':'Pisahkan state dan dampak pembayaran.');
          assert.equal(await page.locator('#sim-viz .big-number').innerText(),'Cancelled','Snapshot must not mutate basic lifecycle');
        }
        await select('s11Trace','late'); await select('s11State','Cancelled'); await select('s11Follow','reconcile'); await action('s11review');
        for (const [field,value,restore] of [['s11Trace','normal','late'],['s11State','Paid','Cancelled'],['s11Follow','record','reconcile']]) {
          await select(field,value); assert.ok(await page.locator('[data-iasd-s11-prediction]').isVisible()); await select(field,restore); await action('s11review');
        }
        await page.reload({waitUntil:'networkidle'}); await feedback('Lifecycle dan tindak lanjut tepat.');
        await page.locator('[data-iasd-supplement="11"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="11"]').innerText()).includes('O-AR11'));
        await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="11"]').getAttribute('open'),null);
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="11"]').innerText()).includes('tiket lokakarya'));
        await page.locator('[data-note="2"]').fill('Transfer tiket lokakarya: Cancelled tetap, bukti uang direkonsiliasi, duplikat tidak mengulang efek.');
        await page.reload({waitUntil:'networkidle'}); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer tiket lokakarya'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="11"] summary').press('Enter'); assert.ok((await page.locator('[data-iasd-facilitation="11"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept'); await page.locator('[data-iasd-supplement="11"] summary').press('Enter');
        for (const dark of [false,true]) {
          if ((await page.locator('html').evaluate(el=>el.classList.contains('dark')))!==dark) await page.locator('[data-act="theme"]').click();
          for (const field of ['s11Trace','s11State','s11Follow']) {
            const control=page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineStyle!=='none'&&el.getBoundingClientRect().height>=44),`S11 focus/tap: ${field}`);
          }
          await checkOverflow('S11 expanded both themes');
          assert.deepEqual(await page.evaluate(()=>{
            const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number),lum=c=>rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="11"] *, [data-iasd-lifecycle-contract] *, [data-iasd-s11-feedback] *')].filter(el=>el.checkVisibility()&&el.tagName!=='OPTION'&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(el=>{
              const st=getComputedStyle(el);let a=el,bg='rgb(255,255,255)';while(a){const c=getComputedStyle(a).backgroundColor;if(rgb(c)[3]!==0){bg=c;break;}a=a.parentElement;}
              const x=lum(st.color),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05),large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
              return ratio<(large?3:4.5)?[{text:el.textContent.slice(0,40),ratio}]:[];
            });
          }),[],'S11 scanned text AA');
        }
        break;
      case 12:
        await select('owner','UI'); await feedback('tidak boleh');
        await page.locator('[data-iasd-reserve-contract] summary').press('Enter');
        for (const trace of ['reserved','stock','lost','denied']) for (const known of ['reserved','rejected','unknown']) for (const next of ['continue','revise','query','access','new']) {
          await select('s12Trace',trace); await select('s12Known',known); await select('s12Next',next); await page.locator('[data-simact="s12review"]').press('Enter');
          const correct=known===({reserved:'reserved',stock:'rejected',lost:'unknown',denied:'rejected'}[trace])&&next===({reserved:'continue',stock:'revise',lost:'query',denied:'access'}[trace]);
          await feedback(correct?'Bukti dan pemulihan tepat.':'Pisahkan hasil diketahui dan tindakan.');
          assert.equal(await page.locator('[data-setting="owner"]').inputValue(),'UI','Reserve snapshot must not change payment owner');
        }
        await select('s12Trace','lost'); await select('s12Known','unknown'); await select('s12Next','query'); await action('s12review');
        for (const [field,value,restore] of [['s12Trace','stock','lost'],['s12Known','rejected','unknown'],['s12Next','new','query']]) {
          await select(field,value); assert.ok(await page.locator('[data-iasd-s12-prediction]').isVisible()); await select(field,restore); await action('s12review');
        }
        await page.reload({waitUntil:'networkidle'}); await feedback('Bukti dan pemulihan tepat.');
        await page.locator('[data-iasd-supplement="12"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="12"]').innerText()).includes('queryReservation'));
        await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="12"]').getAttribute('open'),null);
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="12"]').innerText()).includes('peminjaman kamera'));
        await page.locator('[data-note="2"]').fill('Transfer kamera S12: hasil unknown, telusuri K-CAM ke modul aset; unauthorized perlu review akses.');
        await page.reload({waitUntil:'networkidle'}); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer kamera S12'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="12"] summary').press('Enter'); assert.ok((await page.locator('[data-iasd-facilitation="12"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept'); await page.locator('[data-iasd-supplement="12"] summary').press('Enter');
        for (const dark of [false,true]) {
          if ((await page.locator('html').evaluate(el=>el.classList.contains('dark')))!==dark) await page.locator('[data-act="theme"]').click();
          for (const field of ['owner','s12Trace','s12Known','s12Next']) {
            const control=page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineStyle!=='none'&&el.getBoundingClientRect().height>=44),`S12 focus/tap: ${field}`);
          }
          await checkOverflow('S12 expanded both themes');
          assert.deepEqual(await page.evaluate(()=>{
            const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number),lum=c=>rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="12"] *, [data-iasd-reserve-contract] *, [data-iasd-s12-feedback] *, [data-iasd-s12-proof] *')].filter(el=>el.checkVisibility()&&el.tagName!=='OPTION'&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(el=>{
              const st=getComputedStyle(el);let a=el,bg='rgb(255,255,255)';while(a){const c=getComputedStyle(a).backgroundColor;if(rgb(c)[3]!==0){bg=c;break;}a=a.parentElement;}
              const x=lum(st.color),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05),large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
              return ratio<(large?3:4.5)?[{text:el.textContent.slice(0,40),ratio}]:[];
            });
          }),[],'S12 scanned text AA');
        }
        break;
      case 13:
        await action('screen','Pesanan');
        await page.getByRole('button',{name:'Lanjut checkout',exact:true}).click(); await action('checkout'); await feedback('Tugas navigasi selesai');
        await check('available', false); await action('screen', 'Pesanan');
        await page.getByRole('button',{name:'Lanjut checkout',exact:true}).press('Enter'); await action('checkout'); await feedback('Stok Berubah');
        await page.getByRole('button',{name:'Tinjau pesanan',exact:true}).press('Enter');
        assert.equal(await page.locator('#sim-viz .screen h3').innerText(),'Pesanan');
        await page.getByRole('button',{name:'Lanjut checkout',exact:true}).click(); await action('checkout');
        await page.locator('[data-iasd-task-evidence] summary').press('Enter');
        for (const trace of ['assisted','independent','repeat']) for (const finding of ['assisted','independent','universal']) for (const next of ['revise','retain','isolate']) {
          await select('s13Trace',trace); await select('s13Finding',finding); await select('s13Next',next); await page.locator('[data-simact="s13review"]').press('Enter');
          const correct=finding===(trace==='assisted'?'assisted':'independent')&&next===({assisted:'revise',independent:'retain',repeat:'isolate'}[trace]);
          await feedback(correct?'Kesimpulan dan uji lanjut tepat.':'Pisahkan observasi, tafsir dan klaim.');
          assert.equal(await page.locator('#sim-viz .screen h3').innerText(),'Stok Berubah','Evidence exercise must not mutate prototype screen');
          assert.ok((await page.locator('[data-iasd-s13-feedback]').innerText()).includes('bukan bukti backend'));
        }
        await select('s13Trace','independent'); await select('s13Finding','independent'); await select('s13Next','retain'); await action('s13review');
        for (const [field,value,restore] of [['s13Trace','assisted','independent'],['s13Finding','universal','independent'],['s13Next','revise','retain']]) {
          await select(field,value); assert.ok(await page.locator('[data-iasd-s13-prediction]').isVisible()); await select(field,restore); await action('s13review');
        }
        await page.reload({waitUntil:'networkidle'}); await feedback('Kesimpulan dan uji lanjut tepat.');
        await page.locator('[data-iasd-supplement="13"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="13"]').innerText()).includes('FR01'));
        await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="13"]').getAttribute('open'),null);
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="13"]').innerText()).includes('peminjaman proyektor'));
        await page.locator('[data-note="2"]').fill('Transfer proyektor S13: catat bantuan, jangan klaim sebab revisi dari peserta yang mengulang.');
        await page.reload({waitUntil:'networkidle'}); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer proyektor S13'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="13"] summary').press('Enter'); assert.ok((await page.locator('[data-iasd-facilitation="13"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept'); await page.locator('[data-iasd-supplement="13"] summary').press('Enter');
        for (const dark of [false,true]) {
          if ((await page.locator('html').evaluate(el=>el.classList.contains('dark')))!==dark) await page.locator('[data-act="theme"]').click();
          for (const field of ['s13Trace','s13Finding','s13Next']) {
            const control=page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineStyle!=='none'&&el.getBoundingClientRect().height>=44),`S13 focus/tap: ${field}`);
          }
          await checkOverflow('S13 expanded both themes');
          assert.deepEqual(await page.evaluate(()=>{
            const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number),lum=c=>rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="13"] *, [data-iasd-task-evidence] *, [data-iasd-s13-feedback] *, [data-iasd-s13-proof] *')].filter(el=>el.checkVisibility()&&el.tagName!=='OPTION'&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(el=>{
              const st=getComputedStyle(el);let a=el,bg='rgb(255,255,255)';while(a){const c=getComputedStyle(a).backgroundColor;if(rgb(c)[3]!==0){bg=c;break;}a=a.parentElement;}
              const x=lum(st.color),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05),large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
              return ratio<(large?3:4.5)?[{text:el.textContent.slice(0,40),ratio}]:[];
            });
          }),[],'S13 scanned text AA');
        }
        break;
      case 14:
        await select('change','warna'); await check('impact3'); await check('impact5'); await action('impact'); await feedback('Acuan kasus: UI, Test');
        await page.locator('[data-iasd-version-audit] summary').press('Enter');
        for(const trace of ['stale','boundary','pending','coherent']) for(const verdict of ['revise','confirm','ready']) for(const next of ['version','boundary','approval','review']) {
          await select('s14Trace',trace); await select('s14Verdict',verdict); await select('s14Next',next); await page.locator('[data-simact="s14review"]').press('Enter');
          const correct=verdict===({stale:'revise',boundary:'revise',pending:'confirm',coherent:'ready'}[trace])&&next===({stale:'version',boundary:'boundary',pending:'approval',coherent:'review'}[trace]);
          await feedback(correct?'Audit dan tindak lanjut tepat.':'Buka isi artefak, bukan hanya sel.');
          assert.ok((await page.locator('[data-iasd-s14-feedback]').innerText()).includes('bukan bukti eksekusi'));
          assert.equal(await page.locator('[data-setting="change"]').inputValue(),'warna');
        }
        await select('s14Trace','coherent'); await select('s14Verdict','ready'); await select('s14Next','review'); await action('s14review');
        for(const [field,value,restore] of [['s14Trace','stale','coherent'],['s14Verdict','revise','ready'],['s14Next','version','review']]) {
          await select(field,value); assert.ok(await page.locator('[data-iasd-s14-prediction]').isVisible()); await select(field,restore); await action('s14review');
        }
        await page.reload({waitUntil:'networkidle'}); await feedback('Audit dan tindak lanjut tepat.');
        await page.locator('[data-iasd-supplement="14"] summary').press('Enter');
        assert.ok((await page.locator('[data-iasd-supplement="14"]').innerText()).includes('TC-RES-v2'));
        await page.keyboard.press('Escape'); assert.equal(await page.locator('[data-iasd-supplement="14"]').getAttribute('open'),null);
        await tab('reflect'); assert.ok((await page.locator('[data-iasd-transfer="14"]').innerText()).includes('batas lima unit'));
        await page.locator('[data-note="2"]').fill('Transfer S14: batas lima unit, uji 4/5/6; versi sama belum membuktikan guard benar.');
        await page.reload({waitUntil:'networkidle'}); await tab('reflect'); assert.ok((await page.locator('[data-note="2"]').inputValue()).includes('Transfer S14'));
        await tab('teach'); await page.locator('[data-iasd-facilitation="14"] summary').press('Enter'); assert.ok((await page.locator('[data-iasd-facilitation="14"]').innerText()).includes('Rubrik diagnostik'));
        await tab('concept'); await page.locator('[data-iasd-supplement="14"] summary').press('Enter');
        for(const dark of [false,true]) {
          if((await page.locator('html').evaluate(el=>el.classList.contains('dark')))!==dark) await page.locator('[data-act="theme"]').click();
          for(const field of ['s14Trace','s14Verdict','s14Next']) {
            const control=page.locator(`[data-setting="${field}"]`); await control.focus(); await page.keyboard.press('Tab'); await page.keyboard.press('Shift+Tab');
            assert.ok(await control.evaluate(el=>document.activeElement===el&&getComputedStyle(el).outlineStyle!=='none'&&el.getBoundingClientRect().height>=44),`S14 focus/tap: ${field}`);
          }
          await checkOverflow('S14 expanded both themes');
          assert.deepEqual(await page.evaluate(()=>{
            const rgb=c=>(c.match(/[\d.]+/g)||[]).map(Number),lum=c=>rgb(c).slice(0,3).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((s,v,i)=>s+v*[.2126,.7152,.0722][i],0);
            return [...document.querySelectorAll('[data-iasd-supplement="14"] *, [data-iasd-version-audit] *, [data-iasd-s14-feedback] *, [data-iasd-s14-proof] *')].filter(el=>el.checkVisibility()&&el.tagName!=='OPTION'&&[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())).flatMap(el=>{
              const st=getComputedStyle(el);let a=el,bg='rgb(255,255,255)';while(a){const c=getComputedStyle(a).backgroundColor;if(rgb(c)[3]!==0){bg=c;break;}a=a.parentElement;}
              const x=lum(st.color),y=lum(bg),ratio=(Math.max(x,y)+.05)/(Math.min(x,y)+.05),large=parseFloat(st.fontSize)>=24||(parseFloat(st.fontSize)>=18.66&&Number(st.fontWeight)>=700);
              return ratio<(large?3:4.5)?[{text:el.textContent.slice(0,40),ratio}]:[];
            });
          }),[],'S14 scanned text AA');
        }
        break;
      case 15: await select('change', 'warna'); await check('impact3'); await check('impact5'); await action('impact'); await feedback('Acuan kasus: UI, Test'); break;
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
    await page.locator('[data-iasd-supplement-entry] a[href="/iasd/studio#14"]').click();
    await page.waitForFunction(() => document.querySelector('#main h1')?.textContent === 'Dokumen SRS');
    assert.ok(await page.locator('[data-iasd-version-audit]').isVisible());
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
      assert.equal(await page.locator('[data-iasd-transfer]').count(), [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14].includes(lesson.n) ? 1 : 0, 'Supplement leaked to another session or vanished on grading');
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
    for (const record of Object.values(legacy.lessons)) for (const field of Object.keys(record.sim)) if (/^s(?:14|13|12|11|10|[123456789])/.test(field)) delete record.sim[field];
    page.once('dialog', dialog => dialog.accept());
    await page.setInputFiles('#import-file', { name: 'legacy.json', mimeType: 'application/json', buffer: Buffer.from(JSON.stringify(legacy)) });
    await page.waitForFunction(() => document.querySelector('#toast')?.textContent.includes('Cadangan dipulihkan'));
    await session(4); assert.equal(await page.locator('[data-setting="s4Stock"]').inputValue(), '1');
    assert.ok(await page.locator('[data-iasd-s4-prediction]').isVisible(), 'Legacy backup must start S04 unreviewed without losing notes');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[4].notes[2].includes('Transfer kamera'));
    await session(5); assert.ok(await page.locator('[data-iasd-s5-prediction]').isVisible(), 'Legacy S05 must be unreviewed');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[5].notes[2].includes('Transfer sertifikat'));
    await session(6); assert.ok(await page.locator('[data-iasd-s6-prediction]').isVisible(), 'Legacy S06 must be unreviewed');
    await session(7); assert.ok(await page.locator('[data-iasd-s7-prediction]').isVisible(), 'Legacy S07 must be unreviewed');
    await session(8); assert.ok(await page.locator('[data-iasd-s8-prediction]').isVisible(), 'Legacy S08 must be unreviewed');
    await session(12); assert.ok(await page.locator('[data-iasd-s12-prediction]').isVisible(), 'Legacy S12 must be unreviewed');
    await session(13); assert.ok(await page.locator('[data-iasd-s13-prediction]').isVisible(), 'Legacy S13 must be unreviewed');
    await session(14); assert.ok(await page.locator('[data-iasd-s14-prediction]').isVisible(), 'Legacy S14 must be unreviewed');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[14].notes[2].includes('Transfer S14'));
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[13].notes[2].includes('Transfer proyektor S13'));
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[12].notes[2].includes('Transfer kamera S12'));
    await session(11); assert.ok(await page.locator('[data-iasd-s11-prediction]').isVisible(), 'Legacy S11 must be unreviewed');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[11].notes[2].includes('Transfer tiket lokakarya'));
    await session(10); assert.ok(await page.locator('[data-iasd-s10-prediction]').isVisible(), 'Legacy S10 must be unreviewed');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[10].notes[2].includes('Transfer pemesanan buku'));
    await session(9); assert.ok(await page.locator('[data-iasd-s9-prediction]').isVisible(), 'Legacy S09 must be unreviewed');
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[9].notes[2].includes('Transfer peminjaman alat'));
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[8].notes[2].includes('Transfer ruang konsultasi'));
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[7].notes[2].includes('Transfer peminjaman alat'));
    assert.ok((await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key)).lessons[6].notes[2].includes('Transfer tiket'));
    await session(2); assert.equal(await page.locator('[data-setting="s2Stock"]').inputValue(), '1');
    const restoredLegacy = await page.evaluate(storageKey => JSON.parse(localStorage.getItem(storageKey)), key);
    assert.deepEqual(restoredLegacy.lessons[1].notes, saved.lessons[1].notes);
    page.once('dialog', dialog => dialog.accept());
    await page.setInputFiles('#import-file', { name: 'restored.json', mimeType: 'application/json', buffer: Buffer.from(backup.text) });
    await page.waitForFunction(() => document.querySelector('#toast')?.textContent.includes('Cadangan dipulihkan'));
    await session(6); await feedback('Keputusan sesuai bukti.');
    await session(7); await feedback('Kontrak dan owner tepat.');
    await session(8); await feedback('Jejak dan keputusan cocok.');
    await session(12); await feedback('Bukti dan pemulihan tepat.');
    await session(13); await feedback('Kesimpulan dan uji lanjut tepat.');
    await session(14); await feedback('Audit dan tindak lanjut tepat.');
    await session(11); await feedback('Lifecycle dan tindak lanjut tepat.');
    await session(10); await feedback('Dua alasan tepat.');
    await session(9); await feedback('Dua audit tepat.');
    await session(5); await feedback('Prediksi dan alasan cocok.');
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
    await page.goto(`${baseUrl}/iasd/studio?mode=teach#14`, { waitUntil: 'networkidle' });
    assert.ok(await page.locator('#pane-teach').isVisible());
    await page.locator('[data-iasd-facilitation="14"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-facilitation="14"]').innerText()).includes('Prediksi:'));
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
    await session(5); await select('join', 'merge'); await check('address', true); await check('label', false);
    await select('s5Outcome', 'dini'); await action('s5review'); await feedback('Prediksi dan alasan cocok.');
    await page.locator('[data-iasd-supplement="5"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="5"]').innerText()).includes('bypass'));
    await page.screenshot({ path: `output/playwright/iasd-s05-${profile.name}.png`, fullPage: true });
    await session(6); if (await page.locator('[data-iasd-recovery]').getAttribute('open') === null) await page.locator('[data-iasd-recovery] summary').press('Enter');
    await select('s6Status', 'unknown'); await select('s6Identity', 'match'); await select('s6Decision', 'query'); await action('s6review'); await feedback('Keputusan sesuai bukti.');
    await page.locator('[data-iasd-supplement="6"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="6"]').innerText()).includes('K-AR1'));
    await page.screenshot({ path: `output/playwright/iasd-s06-${profile.name}.png`, fullPage: true });
    await session(7); if (await page.locator('[data-iasd-object-contract]').getAttribute('open') === null) await page.locator('[data-iasd-object-contract] summary').press('Enter');
    await check('draft', true); await range('qty', 0); await select('s7Event', 'submit'); await select('s7Decision', 'reject'); await select('s7Owner', 'Order'); await action('s7review'); await feedback('Kontrak dan owner tepat.');
    await page.locator('[data-iasd-supplement="7"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="7"]').innerText()).includes('O-AR7'));
    await page.screenshot({ path: `output/playwright/iasd-s07-${profile.name}.png`, fullPage: true });
    await session(8); if (await page.locator('[data-iasd-slot-contract]').getAttribute('open') === null) await page.locator('[data-iasd-slot-contract] summary').press('Enter');
    await range('slotCapacity', 2); await range('booked', 1); await select('s8Event', 'cancelClosed'); await select('s8Decision', 'reject'); await action('s8review'); await feedback('Jejak dan keputusan cocok.');
    await page.locator('[data-iasd-supplement="8"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="8"]').innerText()).includes('FR-SLOT'));
    await page.screenshot({ path: `output/playwright/iasd-s08-${profile.name}.png`, fullPage: true });
    await session(10); await page.locator('[data-iasd-price-contract]').evaluate(el => { el.open = true; });
    await check('snapshot', true); await select('s10Discount', 'locked'); await select('s10Parent', 'missing'); await select('s10History', 'yes'); await select('s10Row', 'reject'); await action('s10review'); await feedback('Dua alasan tepat.');
    await page.locator('[data-iasd-supplement="10"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="10"]').innerText()).includes('OI-10'));
    await page.screenshot({ path: `output/playwright/iasd-s10-${profile.name}.png`, fullPage: true });
    await session(9); await page.locator('[data-iasd-data-contract]').evaluate(el => { el.open = true; });
    await check('missing', false); await check('bypass', true); await select('s9Payload', 'complete'); await select('s9Boundary', 'yes'); await select('s9Routing', 'no'); await action('s9review'); await feedback('Dua audit tepat.');
    await page.locator('[data-iasd-supplement="9"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="9"]').innerText()).includes('status_hasil'));
    await page.screenshot({ path: `output/playwright/iasd-s09-${profile.name}.png`, fullPage: true });
    await session(11); await page.locator('[data-iasd-lifecycle-contract]').evaluate(el=>{el.open=true;});
    await select('s11Trace','late'); await select('s11State','Cancelled'); await select('s11Follow','reconcile'); await action('s11review'); await feedback('Lifecycle dan tindak lanjut tepat.');
    await page.locator('[data-iasd-supplement="11"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="11"]').innerText()).includes('O-AR11'));
    await page.screenshot({path:`output/playwright/iasd-s11-${profile.name}.png`,fullPage:true});
    await session(12); await page.locator('[data-iasd-reserve-contract]').evaluate(el=>{el.open=true;});
    await select('s12Trace','lost'); await select('s12Known','unknown'); await select('s12Next','query'); await action('s12review'); await feedback('Bukti dan pemulihan tepat.');
    await page.locator('[data-iasd-supplement="12"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="12"]').innerText()).includes('K-R12'));
    await page.screenshot({path:`output/playwright/iasd-s12-${profile.name}.png`,fullPage:true});
    await session(13); await page.locator('[data-iasd-task-evidence]').evaluate(el=>{el.open=true;});
    await select('s13Trace','repeat'); await select('s13Finding','independent'); await select('s13Next','isolate'); await action('s13review'); await feedback('Kesimpulan dan uji lanjut tepat.');
    await page.locator('[data-iasd-supplement="13"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="13"]').innerText()).includes('usability.csv'));
    await page.screenshot({path:`output/playwright/iasd-s13-${profile.name}.png`,fullPage:true});
    await session(14); await page.locator('[data-iasd-version-audit]').evaluate(el=>{el.open=true;});
    await select('s14Trace','boundary'); await select('s14Verdict','revise'); await select('s14Next','boundary'); await action('s14review'); await feedback('Audit dan tindak lanjut tepat.');
    await page.locator('[data-iasd-supplement="14"] summary').press('Enter');
    assert.ok((await page.locator('[data-iasd-supplement="14"]').innerText()).includes('TC-RES-v2'));
    await page.screenshot({path:`output/playwright/iasd-s14-${profile.name}.png`,fullPage:true});
    assert.equal(errors.length, 0, `IASD browser errors: ${errors.join(' | ')}`);
    await fs.writeFile(`output/playwright/iasd-${profile.name}-results.json`, JSON.stringify(results, null, 2));
    return `${profile.name}: IASD 16 sessions, 48 quiz answers, simulators, lecturer tabs, persistence, backup, downloads and offline PASS`;
  } finally { await context.close(); }
}
