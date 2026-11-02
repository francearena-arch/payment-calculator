import {chromium} from 'playwright';
import {readFile,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const b=await chromium.launch({headless:true,executablePath:process.env.CHROMIUM_PATH||'/tmp/pcc-chromium'});
const p=await b.newPage();
const source=await readFile('public/calculator.js','utf8');
await p.route('**/calculator.js',r=>r.fulfill({contentType:'text/javascript',body:source.replace('window.PCCCalculator={','window.PCCAudit={cost,kinds,offers};window.PCCCalculator={')}));
await p.goto(process.env.TEST_URL||'http://127.0.0.1:8765');await p.waitForSelector('#customer-name');
const comparisons=await p.evaluate(()=>{
 const A=window.PCCAudit;let seed=47,count=0;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<1000;i++){
  const weights=Array.from({length:5},()=>rand()),sum=weights.reduce((a,b)=>a+b,0);
  A.kinds.forEach((k,j)=>Object.assign(k,{share:String(weights[j]/sum*100),ic:String(rand()*2),scheme:String(rand())}));
  const v=1000+rand()*1e7,tx=1+Math.floor(rand()*1e5),c={volume:v,tx};
  const o={model:i%2?'icpp':'split',rates:{},fixed:{},rate:rand()*2,rent:rand()*50,terminals:Math.floor(rand()*5),monthly:rand()*30,annual:rand()*200,setup:rand()*500,minimum:rand()*100,surcharge:rand()};
  let cardCost=0,twint=0;
  for(const k of A.kinds){o.rates[k.id]=rand()*3;o.fixed[k.id]=rand()*.2;const volume=v*Number(k.share)/100,n=tx*Number(k.share)/100;if(k.id==='twint')twint=volume*o.rates[k.id]/100+n*o.fixed[k.id];else cardCost+=volume*(o.model==='split'?o.rates[k.id]:o.rate+Number(k.ic)+Number(k.scheme))/100+n*o.fixed[k.id];}
  const expected=cardCost+twint+v*o.surcharge/100+12*o.rent*o.terminals+12*o.monthly+o.annual+o.setup;
  const actual=A.cost(o,c).total;if(Math.abs(actual-expected)>1e-7*Math.max(1,expected))throw Error('Oracle mismatch '+i);count++;
 }return count;
});
await p.reload();await p.waitForSelector('#customer-name');await p.locator('#demo').click();
await p.locator('.offer').first().locator('[data-model=icpp]').click();
const sample=await p.evaluate(()=>window.PCCCalculator.snapshot().results[0]);
assert.equal(sample.acquiring,1912.5);assert.equal(sample.interchange,1100);assert.equal(sample.scheme,547.5);assert.equal(sample.twint,937.5);assert.equal(sample.terminal,300);assert.equal(sample.total,4797.5);
await p.locator('#volume').fill('500000.50');const decimalVolume=await p.locator('#volume').inputValue();assert.equal(decimalVolume,'500000.50');
await p.locator('#demo').click();await p.locator('.offer').first().locator('.cost-details').evaluate(e=>e.open=true);await p.locator('.offer').first().locator('[data-key=terminals]').fill('-1');await p.locator('.offer').first().locator('[data-key=rent]').fill('0');assert.equal(await p.locator('#print').isDisabled(),true);
// Inactive fixed fees are not validated, yet are included when computing zero blocks.
await p.locator('#demo').click();await p.locator('.offer').first().locator('.secondary-fees').evaluate(e=>e.open=true);await p.locator('.offer').first().locator('[data-key="fixed:other"]').fill('1e308');const inactive=await p.evaluate(()=>window.PCCCalculator.snapshot());
await p.locator('#demo').click();await p.locator('.extra-settings').evaluate(e=>e.open=true);await p.locator('#tx-mix-toggle').check();await p.locator('[data-tx="0"]').fill('2000');await p.locator('[data-tx="4"]').fill('1000');const explicit=await p.evaluate(()=>window.PCCCalculator.snapshot());assert.equal(explicit.ready,false);
const output={comparisons,sample,decimalVolume,explicitZeroVolumePositiveTransactionsAccepted:explicit.ready,explicitTransactions:explicit.transactions,notes:'Oracle verifies the implemented annual model, not contractual tariff completeness.'};await writeFile('test-output/audit-results.json',JSON.stringify(output,null,2));await b.close();console.log(JSON.stringify(output));
