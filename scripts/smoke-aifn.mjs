import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
const course=JSON.parse(await fs.readFile(new URL('../src/data/aifn-course.json',import.meta.url),'utf8'));
const key='hicall-aifn-studio-v1';

export async function runAifnSmoke(browser,baseUrl,profile={name:'desktop',viewport:{width:1365,height:900}}) {
  const context=await browser.newContext({viewport:profile.viewport??{width:1365,height:900},isMobile:profile.isMobile??false,hasTouch:profile.hasTouch??false,acceptDownloads:true});
  const page=await context.newPage();page.setDefaultTimeout(10000);
  const errors=[];page.on('pageerror',error=>errors.push(error.message));
  const results=[];
  const tab=async name=>{await page.locator(`[data-af-tab="${name}"]`).click();assert.ok(await page.locator(`[data-af-pane="${name}"]`).isVisible());};
  const overflow=async label=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1,`${profile.name} overflow ${label}`);
  const session=async n=>{await page.evaluate(n=>document.location.hash=String(n),n);await page.waitForFunction(n=>document.querySelector('h1')?.textContent===n,course.lessons[n-1].title);await tab('concept');};
  try {
    await page.goto(`${baseUrl}/aifn`);assert.ok(await page.locator('[data-aifn-overview]').isVisible());
    assert.equal(await page.locator('.af-map li').count(),16);await overflow('overview');
    await page.goto(`${baseUrl}/aifn/studio#1`);
    await page.waitForSelector('[data-course-visual]');
    assert.deepEqual(await page.locator('#aifn-course-data').evaluate(el=>JSON.parse(el.textContent)),course);
    await page.evaluate(()=>localStorage.setItem('hicall-iasd-smoke-sentinel','untouched'));
    for(const lesson of course.lessons) {
      await session(lesson.id);
      assert.equal(await page.locator(`[data-course-visual="${lesson.id}"]`).count(),1);
      assert.ok((await page.locator('svg title').textContent()).length>10);
      assert.ok((await page.locator('svg desc').textContent()).length>30);
      assert.ok((await page.locator('[data-aifn-equivalent]').textContent()).length>30);
      await page.locator('#af-zoom').focus();await page.keyboard.press('Enter');
      assert.equal(await page.locator('#af-zoom').getAttribute('aria-pressed'),'true');
      assert.ok(await page.locator('[data-course-visual]').evaluate(el=>el.getBoundingClientRect().width>=480));
      await overflow(`zoomed session ${lesson.id}`);
      await page.locator('#af-zoom').click();assert.equal(await page.locator('#af-zoom').getAttribute('aria-pressed'),'false');
      const control=page.locator('#af-setting');
      assert.ok(await control.evaluate(el=>el.getBoundingClientRect().height>=44));
      const values=lesson.control.options?.map(([v])=>v)??[lesson.control.min,lesson.control.value,lesson.control.max];
      let changed=false;let previous='';
      for(const value of values) {
        if(lesson.control.options) await control.selectOption(String(value));
        else await control.evaluate((el,value)=>{el.value=String(value);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
        const equivalent=await page.locator('[data-aifn-equivalent]').innerText();if(previous&&previous!==equivalent)changed=true;previous=equivalent;
        for(const prediction of ['safe','revise']) {
          await page.locator('#af-prediction').selectOption(prediction);await page.locator('#af-reason').click();
          assert.match(await page.locator('#af-reason-result').innerText(),/Alasan pilihan tepat|Tinjau pilihan Anda/);
          assert.ok((await page.locator('#af-reason-result').innerText()).length>90);
        }
      }
      assert.ok(changed,`Session ${lesson.id} control must change readable evidence`);
      const example=page.locator('details').first();await example.locator('summary').click();assert.ok((await example.innerText()).includes(lesson.worked));
      await overflow(`session ${lesson.id}`);
      await tab('quiz');
      for(let i=0;i<lesson.quiz.options.length;i++){
        await page.locator(`input[name="answer"][value="${i}"]`).check();await page.locator('#af-quiz button[type="submit"]').click();
        assert.equal(await page.locator('#af-quiz-result').innerText(),lesson.quiz.explanations[i]);
      }
      await page.locator('#af-notes').fill(`AiFn ${lesson.id}: bukti sintetis dan batasan`);await page.locator('#af-done').check();
      await tab('teach');assert.ok((await page.locator(`[data-aifn-teacher="${lesson.id}"]`).innerText()).includes(lesson.teacher.probe));
      await page.locator('[data-af-pane="teach"] summary').click();assert.ok((await page.locator('[data-af-pane="teach"]').innerText()).includes(lesson.quiz.explanations[lesson.quiz.answer]));
      await tab('practice');assert.equal(await page.locator('[data-af-pane="practice"] a[download]').count(),3);
      results.push({session:lesson.id,visual:true,controls:values.length,quizOptions:3,teacher:true});
    }
    await page.reload();await page.waitForSelector('h1');await tab('quiz');
    assert.equal(await page.locator('#af-notes').inputValue(),'AiFn 16: bukti sintetis dan batasan');
    assert.ok(await page.locator('#af-done').isChecked());
    await page.locator('[data-af-pane="quiz"] summary').click();
    const downloadPromise=page.waitForEvent('download');await page.locator('#af-export').click();const download=await downloadPromise;
    const exported=JSON.parse(await fs.readFile(await download.path(),'utf8'));assert.equal(Object.keys(exported.lessons).length,16);
    for(const invalid of [{...exported,course:'iasd'},{...exported,version:99},{...exported,lessons:{'17':{notes:'bad',done:true}}}]) {
      await page.locator('#af-import').setInputFiles({name:'wrong.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(invalid))});
      await page.waitForFunction(()=>document.querySelector('#aifn-status').textContent.includes('Impor ditolak'));
      assert.equal(await page.evaluate(key=>JSON.parse(localStorage.getItem(key)).course,key),'aifn');
    }
    const imported=structuredClone(exported);imported.lessons['16'].notes='imported valid AiFn';
    await page.locator('#af-import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(imported))});
    await page.waitForFunction(()=>document.querySelector('#aifn-status').textContent.includes('diimpor dan divalidasi'));
    assert.equal(await page.locator('#af-notes').inputValue(),'imported valid AiFn');
    assert.equal(await page.evaluate(()=>localStorage.getItem('hicall-iasd-smoke-sentinel')),'untouched');
    await tab('practice');
    // A deliberate download cadence matches human clicks and avoids Chromium burst suppression.
    for(const [suffix,expected] of [['aifn-labs.ipynb','nbformat'],['aifn-synthetic.csv','debt_ratio'],['README.txt','Jupyter']]) {
      await page.waitForTimeout(200);
      console.log(`AiFn ${profile.name} download check: ${suffix}`);
      const d=page.waitForEvent('download');await page.locator(`a[download][href$="${suffix}"]`).click();const file=await d;
      const data=await fs.readFile(await file.path(),'utf8');assert.ok(data.includes(expected));if(suffix.endsWith('ipynb'))assert.equal(JSON.parse(data).nbformat,4);
    }
    await page.goto(`${baseUrl}/aifn/studio?mode=teach#1`);await page.waitForSelector('[data-aifn-teacher="1"]');
    assert.ok(await page.locator('[data-af-pane="teach"]').isVisible());
    await page.locator('[data-af-tab="teach"]').focus();await page.keyboard.press('Home');assert.equal(await page.locator('[data-af-tab="concept"]').getAttribute('aria-selected'),'true');
    await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-af-tab="practice"]').getAttribute('aria-selected'),'true');
    await page.locator('#af-session').focus();await page.keyboard.press('ArrowDown');await page.keyboard.press('Enter');await page.waitForFunction(()=>document.location.hash==='#2');
    await session(2);await page.locator('#af-setting').selectOption('empty');assert.match(await page.locator('[data-aifn-equivalent]').innerText(),/Belum ada/);
    await page.locator('#af-setting').selectOption('error');assert.match(await page.locator('[data-aifn-equivalent]').innerText(),/Error/);
    const initialTheme=await page.locator('html').getAttribute('data-theme');
    await page.locator('#aifn-theme').click();assert.notEqual(await page.locator('html').getAttribute('data-theme'),initialTheme);await overflow('theme one');
    await page.locator('#aifn-theme').click();assert.equal(await page.locator('html').getAttribute('data-theme'),initialTheme);await overflow('theme two');
    await session(9);await tab('practice');
    await context.grantPermissions(['clipboard-read','clipboard-write']);
    await page.locator('#af-copy').click();await page.waitForFunction(()=>document.querySelector('#af-copy-status').textContent.includes('Prompt tersalin'));
    assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),course.lessons[8].prompt);
    await session(1);assert.ok(await page.locator('#af-prev').isDisabled());await page.locator('#af-next').click();await page.waitForFunction(()=>location.hash==='#2');
    await page.locator('#af-prev').click();await page.waitForFunction(()=>location.hash==='#1');
    await session(16);assert.ok(await page.locator('#af-next').isDisabled());
    await session(2);await tab('concept');
    await fs.mkdir('output',{recursive:true});await page.screenshot({path:`output/aifn-${profile.name}.png`,fullPage:true});
    const isDev=await page.locator('script[src*="@vite"]').count()>0;
    let offline='not exercised on Vite dev modules; production integration required';
    if(!isDev) {
      await page.waitForFunction(()=>document.documentElement.dataset.aifnOffline==='ready',null,{timeout:20000});
      await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await page.waitForSelector('[data-course-visual]', {state:'attached'});await tab('concept');
      for(const n of course.lessons.map(lesson=>lesson.id)) {await session(n);assert.ok(await page.locator('[data-course-visual]').isVisible());}
      await tab('practice');const d=page.waitForEvent('download');await page.locator('a[download][href$="aifn-labs.ipynb"]').click();assert.ok((await fs.readFile(await(await d).path(),'utf8')).includes('nbformat'));
      await page.goto(`${baseUrl}/aifn`);assert.ok(await page.locator('[data-aifn-overview]').isVisible());offline='PASS: actual service worker, studio reload/sessions/notebook/overview offline';
      await context.setOffline(false);
    }
    assert.deepEqual(errors,[],'No browser page errors');
    const report={profile:profile.name,sessions:results,storage:'PASS isolated notes, done, setting, quiz, export, valid import, rejected wrong course/version/id',keyboard:'PASS native select and roving arrow/Home tabs',downloads:'PASS ipynb CSV README',offline,errors};
    await fs.writeFile(`output/aifn-smoke-${profile.name}.json`,JSON.stringify(report,null,2));return report;
  } finally {await context.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
  const {chromium}=await import('playwright');const browser=await chromium.launch({headless:true});
  try {for(const profile of [{name:'desktop',viewport:{width:1365,height:900}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true}])console.log(JSON.stringify(await runAifnSmoke(browser,process.argv[2]??'http://127.0.0.1:4325',profile)));}
  finally {await browser.close();}
}
