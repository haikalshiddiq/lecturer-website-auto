import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
import { pathToFileURL } from 'node:url';
import { analyzeFinance, metricsAt } from '../src/scripts/aifn-finance-engine.js';
const course=JSON.parse(await fs.readFile(new URL('../src/data/aifn-course.json',import.meta.url),'utf8'));
const key='hicall-aifn-studio-v1';
export async function runAifnSmoke(browser,baseUrl,profile={name:'desktop',viewport:{width:1365,height:900}}){
 const context=await browser.newContext({viewport:profile.viewport??{width:1365,height:900},isMobile:profile.isMobile??false,hasTouch:profile.hasTouch??false,acceptDownloads:true});
 const page=await context.newPage();page.setDefaultTimeout(15000);const errors=[],results=[];page.on('pageerror',e=>errors.push(e.message));
 const tab=async name=>{await page.locator(`[data-af-tab="${name}"]`).click();assert.ok(await page.locator(`[data-af-pane="${name}"]`).isVisible());};
 const overflow=async label=>assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth)<=1,`${profile.name}: overflow ${label}`);
 const ready=()=>page.waitForSelector('[data-aifn-data-state="ready"]',{state:'attached'});
 const session=async n=>{await page.evaluate(n=>location.hash=String(n),n);await page.waitForFunction(title=>document.querySelector('h1')?.textContent===title,course.lessons[n-1].title);await tab('concept');};
 try{
  const source=await(await context.request.get(`${baseUrl}/aifn/data/credit.json`)).json(),expected=analyzeFinance(source.records);
  await page.goto(`${baseUrl}/aifn`);assert.ok(await page.locator('[data-aifn-overview]').isVisible());assert.equal(await page.locator('.af-map li').count(),16);await overflow('overview');
  assert.equal(await page.locator('link[rel="manifest"]').getAttribute('href'),'/aifn/manifest.webmanifest');
  const manifest=await(await context.request.get(`${baseUrl}/aifn/manifest.webmanifest`)).json();assert.match(manifest.name,/^AiFn/);assert.equal(manifest.short_name,'AiFn');assert.match(manifest.start_url,/\/aifn\/studio/);
  await page.locator('#aifn-install').click();await page.locator('#aifn-install-help').waitFor({state:'visible'});await page.keyboard.press('Escape');assert.ok(!await page.locator('#aifn-install-help').isVisible());
  await page.goto(`${baseUrl}/aifn/studio#1`);await ready();
  assert.deepEqual(await page.locator('#aifn-course-data').evaluate(el=>JSON.parse(el.textContent)),course);
  const values=await page.locator('[data-aifn-data-state="ready"]').evaluate(el=>({n:Number(el.dataset.aifnN),mae:Number(el.dataset.aifnMae),auc:Number(el.dataset.aifnAuc)}));
  assert.equal(values.n,expected.classification.scores.length);assert.equal(values.mae,expected.regression.mae);assert.equal(values.auc,expected.classification.auc);
  await page.evaluate(()=>localStorage.setItem('hicall-iasd-smoke-sentinel','untouched'));
  for(const l of course.lessons){
   await session(l.id);assert.ok(await page.locator(`[data-course-visual="${l.id}"]`).count()>=1);assert.ok((await page.locator('[data-aifn-equivalent]').innerText()).length>40);
   assert.ok(!/NaN|Infinity|undefined/.test(await page.locator('#af-viz').innerText()));
   assert.ok(await page.locator('#af-setting').evaluate(el=>el.getBoundingClientRect().height>=44));
   if(await page.locator('#af-zoom').count()){
    await page.locator('#af-zoom').focus();await page.keyboard.press('Enter');await page.locator('#af-chart-dialog').waitFor({state:'visible'});
    assert.ok(await page.locator('[data-aifn-enlarged]').evaluate(el=>el.getBoundingClientRect().width>=700));await page.keyboard.press('Escape');assert.equal(await page.evaluate(()=>document.activeElement.id),'af-zoom');
   }
   const settings=l.control.options?.map(([v])=>v)??[l.control.min,l.control.value,l.control.max];let previous='',changed=false;
   for(const value of settings){
    if(l.control.options)await page.locator('#af-setting').selectOption(String(value));else await page.locator('#af-setting').evaluate((el,v)=>{el.value=String(v);el.dispatchEvent(new Event('input',{bubbles:true}));},value);
    const text=await page.locator('[data-aifn-equivalent]').innerText();if(previous&&text!==previous)changed=true;previous=text;
    if(l.kind==='workflow'){
     const leaked=value==='after';
     assert.ok(text.includes(`${leaked?5:4} kolom dikirim sebagai input, 4 fitur kandidat dan ${leaked?1:0} target terlarang`));
     assert.match(text,/tidak dilatih ulang/);
     const rows=await page.locator('#af-viz tbody tr').allTextContents();assert.equal(rows.length,5);
     assert.match(rows[4],leaked?/SALAH: target masuk input/:/Target terpisah/);
     assert.deepEqual(await page.locator('#af-viz [data-course-visual] rect').evaluateAll(xs=>xs.map(x=>Number(x.getAttribute('width')))),[250,leaked?62.5:0]);
    }
    if(l.kind==='data'){
     const contract=await page.locator('#af-viz [data-aifn-contract]').evaluate(el=>({...el.dataset}));
     const counts=value==='empty'?[0,0,0]:value==='error'?[3,2,1]:[3,3,0];
     assert.deepEqual([Number(contract.rows),Number(contract.valid),Number(contract.invalid)],counts);
     assert.equal(contract.mean,value==='valid'?'400':'unavailable');
     assert.match(text,/Fixture sintetis/);assert.match(text,/model tetap tidak berubah/);
     const max=Math.max(1,...counts);
     assert.deepEqual(await page.locator('#af-viz [data-course-visual] rect').evaluateAll(xs=>xs.map(x=>Number(x.getAttribute('width')))),counts.map(x=>x/max*250));
     if(value==='error')assert.match((await page.locator('#af-viz tbody tr').allTextContents())[1],/2\[kosong\]DITOLAK/);
     if(value==='empty')assert.match(await page.locator('#af-viz tbody').innerText(),/Mean tidak terdefinisi/);
     assert.match(await page.locator('#af-reason-result').innerText(),/Pilih benar atau tidak/);
    }
    const feedback=[];for(const answer of ['safe','revise']){await page.locator('#af-prediction').selectOption(answer);await page.locator('#af-reason').click();feedback.push(await page.locator('#af-reason-result').innerText());}
    assert.equal(feedback.filter(s=>s.startsWith('Alasan pilihan tepat.')).length,1);assert.equal(feedback.filter(s=>s.startsWith('Tinjau pilihan Anda.')).length,1);
    if(l.kind==='workflow'){
     assert.ok(feedback[value==='after'?1:0].startsWith('Alasan pilihan tepat.'));
     assert.match(feedback[0],value==='after'?/Hapus risk dari input/:/tanggal dan horizon UCI tidak diketahui/);
    }
    if(l.kind==='data'){
     assert.ok(feedback[value==='valid'?0:1].startsWith('Alasan pilihan tepat.'));
     assert.match(feedback[0],value==='valid'?/400 unit latihan/:value==='empty'?/COUNT = 0/:/1000 \/ 3/);
    }
    if(l.kind==='explain'){const trace=await page.locator('#af-viz [data-aifn-logit]').evaluate(el=>({score:Number(el.dataset.aifnScore),reconstructed:Number(el.dataset.aifnReconstructed),logit:Number(el.dataset.aifnLogit)}));const i=Math.min(expected.classification.scores.length-1,Math.floor(Number(value)*(expected.classification.scores.length-1)));assert.ok(Number.isFinite(trace.logit));assert.ok(Math.abs(trace.score-expected.classification.scores[i].score)<1e-12);assert.ok(Math.abs(trace.reconstructed-trace.score)<1e-12);}
    if(['classification','evaluation'].includes(l.kind)){const m=metricsAt(expected.classification.scores,Number(value));for(const name of ['TP','FP','TN','FN'])assert.ok(text.includes(`${name} ${m[name]}`));assert.ok(text.includes(expected.classification.auc.toLocaleString('id-ID',{maximumFractionDigits:3})));}
   }
   assert.ok(changed,`session ${l.id} control changes evidence`);await overflow(`session ${l.id}`);
   await page.locator('#af-continue').click();assert.ok(await page.locator('[data-af-pane="practice"]').isVisible());
   assert.ok(l.financeLab,`session ${l.id}: financeLab required`);assert.equal(await page.locator('[data-af-step]').count(),l.financeLab.steps.length);
   for(let i=0;i<l.financeLab.steps.length;i++){await page.locator(`[data-af-step="${i}"]`).click();assert.ok((await page.locator('[data-aifn-guided]').innerText()).includes(l.financeLab.steps[i].expectedEvidence));}
   assert.equal(await page.locator('[data-af-pane="practice"] a[download]').count(),3);await overflow(`practice ${l.id}`);
   await page.locator('#af-continue').click();assert.ok(await page.locator('[data-af-pane="quiz"]').isVisible());
   for(let i=0;i<l.quiz.options.length;i++){await page.locator(`input[name="answer"][value="${i}"]`).check();await page.locator('#af-quiz button').click();assert.equal(await page.locator('#af-quiz-result').innerText(),l.quiz.explanations[i]);}
   await page.locator('#af-notes').fill(`AiFn ${l.id}: bukti data publik dan batasan`);await page.locator('#af-done').check();
   await tab('teach');assert.ok((await page.locator(`[data-aifn-teacher="${l.id}"]`).innerText()).includes(l.teacher.probe));await page.locator('[data-af-pane="teach"] summary').click();assert.ok((await page.locator('[data-af-pane="teach"]').innerText()).includes(l.quiz.explanations[l.quiz.answer]));
   results.push({session:l.id,realEvidence:true,finite:true,controls:settings.length,guidedSteps:l.financeLab.steps.length,teacher:true,quizOptions:l.quiz.options.length});
  }
  assert.equal(results.length,16);await page.reload();await ready();await tab('quiz');assert.equal(await page.locator('#af-notes').inputValue(),'AiFn 16: bukti data publik dan batasan');assert.ok(await page.locator('#af-done').isChecked());
  await page.locator('[data-af-pane="quiz"] summary').click();const pending=page.waitForEvent('download');await page.locator('#af-export').click();const exported=JSON.parse(await fs.readFile(await(await pending).path(),'utf8'));assert.equal(Object.keys(exported.lessons).length,16);
  for(const bad of [{...exported,course:'iasd'},{...exported,version:99},{...exported,lastSession:17},{...exported,lessons:{'17':{notes:'bad',done:true}}}]){await page.locator('#af-import').setInputFiles({name:'bad.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(bad))});await page.waitForFunction(()=>document.querySelector('#aifn-status').textContent.includes('Impor ditolak'));}
  for(const modern of [false,true]){const valid=structuredClone(exported);delete valid.lastSession;if(modern)valid.lastSession=16;valid.lessons['16'].notes=modern?'new valid backup':'legacy valid backup';await page.locator('#af-import').setInputFiles({name:'valid.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(valid))});await page.waitForFunction(()=>document.querySelector('#aifn-status').textContent.includes('diimpor dan divalidasi'));assert.equal(await page.locator('#af-notes').inputValue(),valid.lessons['16'].notes);await page.locator('[data-af-pane="quiz"] summary').click();}
  assert.equal(await page.evaluate(()=>localStorage.getItem('hicall-iasd-smoke-sentinel')),'untouched');
  await tab('practice');for(const [suffix,contains]of [['aifn-labs.ipynb','nbformat'],['aifn-finance.csv','duration'],['README.txt','Jupyter']]){await page.waitForTimeout(200);const d=page.waitForEvent('download');await page.locator(`a[download][href$="${suffix}"]`).click();const content=await fs.readFile(await(await d).path(),'utf8');assert.ok(content.includes(contains));if(suffix.endsWith('ipynb'))assert.equal(JSON.parse(content).nbformat,4);}
  await session(9);await tab('practice');await context.grantPermissions(['clipboard-read','clipboard-write']);await page.locator('#af-copy').click();await page.waitForFunction(()=>document.querySelector('#af-copy-status').textContent.includes('Prompt tersalin'));assert.equal(await page.evaluate(()=>navigator.clipboard.readText()),course.lessons[8].prompt);
  await page.goto(`${baseUrl}/aifn/studio?mode=teach#1`);await ready();assert.ok(await page.locator('[data-af-pane="teach"]').isVisible());await page.locator('[data-af-tab="teach"]').focus();await page.keyboard.press('Home');assert.equal(await page.locator('[data-af-tab="concept"]').getAttribute('aria-selected'),'true');await page.keyboard.press('ArrowRight');assert.equal(await page.locator('[data-af-tab="practice"]').getAttribute('aria-selected'),'true');
  await session(5);await page.goto(`${baseUrl}/aifn`);await page.locator('#aifn-resume').click();await ready();assert.equal(new URL(page.url()).hash,'#5');
  await page.goto(`${baseUrl}/aifn/studio?resume=1`);await ready();assert.equal(new URL(page.url()).hash,'#5');
  for(let i=0;i<2;i++){await page.locator('#aifn-theme').click();await overflow(`theme ${i}`);}
  const dev=await page.locator('script[src*="@vite"]').count()>0;let offline='Production-only pack verification not run on Vite dev';
  if(!dev){
   await page.waitForFunction(()=>document.documentElement.dataset.aifnOffline==='ready',null,{timeout:45000});
   // A page route cannot reliably fault requests owned by the service worker. Inject a cache-write failure in the page realm instead.
   await page.evaluate(()=>{window.__aifnOriginalCachePut=Cache.prototype.put;Cache.prototype.put=function(request,response){const url=typeof request==='string'?request:request.url;if(new URL(url,location.origin).pathname==='/aifn/README.txt')return Promise.reject(new DOMException('Test fixture: storage quota exhausted','QuotaExceededError'));return window.__aifnOriginalCachePut.call(this,request,response);};});
   await page.locator('#aifn-offline-prepare').click();
   await page.waitForFunction(()=>document.documentElement.dataset.aifnOffline==='error',null,{timeout:45000});
   assert.match(await page.locator('#aifn-pwa-status').innerText(),/belum siap/i);
   assert.equal(await page.evaluate(async()=>Boolean(await(await caches.open('hicall-aifn-pack-v2')).match('/aifn/offline-receipt.json'))),false);
   await page.evaluate(()=>{Cache.prototype.put=window.__aifnOriginalCachePut;delete window.__aifnOriginalCachePut;});
   await page.locator('#aifn-offline-prepare').click();
   await page.waitForFunction(()=>document.documentElement.dataset.aifnOffline==='ready',null,{timeout:45000});
   await context.setOffline(true);await page.reload({waitUntil:'domcontentloaded'});await ready();
   for(const l of course.lessons){await session(l.id);assert.ok(await page.locator(`[data-course-visual="${l.id}"]`).count()>=1);}
   await page.goto(`${baseUrl}/aifn`);assert.ok(await page.locator('[data-aifn-overview]').isVisible());await page.locator('#aifn-resume').click();await ready();assert.equal(new URL(page.url()).hash,'#16');await context.setOffline(false);
   offline='PASS actual prepared-cache reload, all sessions, overview and resume offline; explicit storage-failure fixture and recovery';
  }
  // Network fixtures exist only in tests; application content never replaces source records.
  const failureContext=await browser.newContext({viewport:profile.viewport,serviceWorkers:'block'}),failure=await failureContext.newPage();
  try{let release;const gate=new Promise(resolve=>release=resolve);await failure.route('**/aifn/data/credit.json',async r=>{await gate;await r.continue();});await failure.goto(`${baseUrl}/aifn/studio?fixture=loading#2`);await failure.waitForSelector('[data-aifn-data-state="loading"]');release();await failure.waitForSelector('[data-aifn-data-state="ready"]');await failure.unroute('**/aifn/data/credit.json');for(const response of [{status:503,body:'unavailable'},{status:200,body:JSON.stringify({meta:source.meta,records:[]})},{status:200,body:JSON.stringify({meta:source.meta,records:[{amount:'broken'}]})}]){await failure.route('**/aifn/data/credit.json',r=>r.fulfill({contentType:'application/json',...response}));await failure.goto(`${baseUrl}/aifn/studio?fixture=${response.status}-${response.body.length}#2`);await failure.waitForSelector(`[data-aifn-data-state="${response.body.includes('"records":[]')?'empty':'error'}"]`);await failure.unroute('**/aifn/data/credit.json');await failure.locator('#af-retry').click();await failure.waitForSelector('[data-aifn-data-state="ready"]');}}finally{await failureContext.close();}
  assert.deepEqual(errors,[],'No page errors');await fs.mkdir('output',{recursive:true});await page.screenshot({path:`output/aifn-${profile.name}.png`,fullPage:true});
  const report={profile:profile.name,sessions:results,data:{records:source.records.length,holdout:values.n,mae:values.mae,auc:values.auc},storage:'PASS legacy and optional-field backups, notes, done, isolation and rejection',keyboard:'PASS roving tabs, chart dialog Escape and focus return',downloads:'PASS actual notebook, finance CSV, README',install:'PASS manifest and manual fallback dialog',resume:'PASS overview and startup resume',recovery:'PASS gated loading, HTTP error, actual empty response, malformed response, retry',offline,errors};await fs.writeFile(`output/aifn-smoke-${profile.name}.json`,JSON.stringify(report,null,2));return report;
 }finally{await context.close();}
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){const{chromium}=await import('playwright');const browser=await chromium.launch({headless:true});try{for(const profile of [{name:'desktop',viewport:{width:1365,height:900}},{name:'mobile',viewport:{width:390,height:844},isMobile:true,hasTouch:true},{name:'narrow',viewport:{width:320,height:740},isMobile:true,hasTouch:true}])console.log(JSON.stringify(await runAifnSmoke(browser,process.argv[2]??'http://127.0.0.1:4331',profile)));}finally{await browser.close();}}
