import assert from 'node:assert/strict';
import {chromium} from 'playwright';
import {waitForAifnImport} from './smoke-aifn.mjs';
const browser=await chromium.launch({headless:true});
try{
 const context=await browser.newContext({serviceWorkers:'block'}),page=await context.newPage();
 await page.goto((process.argv[2]||'http://127.0.0.1:4343')+'/aifn/studio#16');
 await page.waitForSelector('[data-aifn-data-state="ready"]');await page.locator('[data-af-tab="quiz"]').click();
 await page.locator('[data-af-pane="quiz"] summary').click();
 const backup=notes=>({course:'aifn',version:1,lessons:{'16':{notes,done:false}}});
 await page.locator('#af-import').setInputFiles({name:'legacy.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify(backup('legacy valid backup')))});
 await page.waitForFunction(()=>document.querySelector('#af-notes').value==='legacy valid backup');
 await page.locator('[data-af-pane="quiz"] summary').click();
 // Hold the real file-read boundary so a stale success status cannot certify the next import.
 await page.evaluate(()=>{const original=File.prototype.text;File.prototype.text=async function(){const text=await original.call(this);window.__importReadPending=true;await new Promise(resolve=>window.__releaseImport=resolve);return text;};});
 await page.locator('#af-import').setInputFiles({name:'modern.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({...backup('new valid backup'),lastSession:16}))});
 await page.waitForFunction(()=>window.__importReadPending===true);
 const held=await page.evaluate(()=>({status:document.querySelector('#aifn-status').textContent,notes:document.querySelector('#af-notes').value}));
 assert.match(held.status,/diimpor dan divalidasi/);assert.equal(held.notes,'legacy valid backup');
 let released=false,finishedBeforeRelease=false;
 const wait=waitForAifnImport(page,'new valid backup').then(()=>{finishedBeforeRelease=!released;});
 // A fresh browser round trip runs the readiness predicate while the import is still gated.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 released=true;await page.evaluate(()=>window.__releaseImport());await wait;
 assert.equal(finishedBeforeRelease,false,'Import readiness accepted the previous import success status while File.text was still pending');
 assert.equal(await page.locator('#af-notes').inputValue(),'new valid backup');
 console.log(JSON.stringify({status:'PASS',held,readiness:'waited for exact new notes, not stale status',sleep:false,timeoutChanged:false}));
 await context.close();
}finally{await browser.close();}
