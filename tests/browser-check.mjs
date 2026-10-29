import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,readFile} from 'node:fs/promises';
const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_PATH?{executablePath:process.env.CHROMIUM_PATH}:{})});
const page=await browser.newPage({acceptDownloads:true});const errors=[];page.on('pageerror',e=>errors.push(e.message));
await mkdir('test-output',{recursive:true});
await page.goto(process.env.TEST_URL||'http://127.0.0.1:8765');
await page.waitForSelector('#customer-name');
assert.equal(await page.locator('.offer').count(),2);
assert.equal(await page.locator('[data-mode]').count(),0);
await page.locator('#customer-name').fill('Müller & Söhne AG');
await page.locator('#account-id').fill('001-test-account');
await page.locator('#channel').selectOption('Backoffice / Retention');
await page.locator('#purpose').selectOption('retention');
await page.locator('#competitor-provider').selectOption('Worldline');
await page.locator('#demo').click();
let download=page.waitForEvent('download');await page.locator('#export-json').click();let file=await download;await file.saveAs('test-output/comparison.json');
let s=JSON.parse(await readFile('test-output/comparison.json','utf8'));assert.equal(s.customerName,'Müller & Söhne AG');assert.equal(s.competitor,'Worldline');assert.equal(s.inputs.annualTransactions,10000);assert.equal(s.results[0].total,6587.5);assert.equal(s.inputs.offers.length,2);
// Different pricing model on each side, independent of the competitor dropdown.
await page.locator('.offer').first().locator('[data-model="icpp"]').click();await page.locator('.offer').first().locator('[data-key="rate"]').fill('0.45');
await page.locator('#competitor-provider').selectOption('Other');await page.locator('#other-provider').fill('Test & Partner');
await page.route('**/api/send-pdf',async route=>{const body=route.request().postDataBuffer();assert.ok(body.includes(Buffer.from('%PDF-')));assert.ok(!body.includes(Buffer.from('RESEND_API_KEY')));await route.fulfill({status:200,contentType:'application/json',body:'{"code":"accepted"}'});});
download=page.waitForEvent('download');await page.locator('#print').click();file=await download;await file.saveAs('test-output/comparison.pdf');await page.waitForFunction(()=>!document.querySelector('#new-case').disabled);
download=page.waitForEvent('download');await page.locator('#export-json').click();file=await download;await file.saveAs('test-output/mixed.json');s=JSON.parse(await readFile('test-output/mixed.json','utf8'));assert.equal(s.results[0].total,4797.5);assert.equal(s.competitor,'Test & Partner');assert.equal(s.inputs.offers[0].model,'icpp');assert.equal(s.inputs.offers[1].model,'split');
for(const lang of ['fr','en','it','de']){await page.locator('#language-trigger').click();await page.locator(`[data-language="${lang}"]`).click();assert.equal(await page.locator('#customer-name').inputValue(),'Müller & Söhne AG');download=page.waitForEvent('download');await page.locator('#print').click();file=await download;await file.saveAs(`test-output/comparison-${lang}.pdf`);await page.waitForFunction(()=>!document.querySelector('#new-case').disabled);}
await page.screenshot({path:'test-output/desktop.png',fullPage:true});
await page.unroute('**/api/send-pdf');await page.route('**/api/send-pdf',route=>route.fulfill({status:502,body:'error'}));download=page.waitForEvent('download');await page.locator('#print').click();await download;await page.waitForSelector('#action-status.error');
// Reset clears identity and pricing, without browser storage.
page.once('dialog',d=>d.accept());await page.locator('#new-case').click();await page.waitForFunction(()=>document.querySelector('#customer-name')?.value==='');assert.equal(await page.locator('#account-id').inputValue(),'');assert.equal(await page.locator('#competitor-provider').inputValue(),'');assert.equal(await page.evaluate(()=>localStorage.length+sessionStorage.length),0);
await page.setViewportSize({width:390,height:844});await page.screenshot({path:'test-output/mobile.png',fullPage:true});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);assert.deepEqual(errors,[]);await browser.close();console.log('Browser checks passed: direct access, validation, mixed models, JSON, PDF, four languages, mail failure, reset, mobile.');
