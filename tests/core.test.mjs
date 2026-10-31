import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
const context={window:{}};vm.runInNewContext(readFileSync(new URL('../public/calculation-core.js',import.meta.url),'utf8'),context);const C=context.window.PCCCore;
test('annual money accepts Swiss grouping and point/comma decimals without silently altering value',()=>{
 for(const text of ['500000.50','500000,50',"500'000.50",'500’000,50','500 000.50'])assert.equal(C.annual(text),500000.5,text);
 assert.equal(C.formatAnnual('500000.50'),'500’000.50');assert.equal(C.formatAnnual('10000',true),'10’000');
 for(const text of ['-500','1e6','CHF 500000','500.000,50','500,000.50','500.000','500000.501','12 34','0x100','Infinity','NaN','1.2.3','1.','1,','1000000000001']){assert.equal(C.annual(text),null,text);assert.equal(C.formatAnnual(text),text);}
});
test('transactions must be safe whole counts and money/percentage limits are enforced',()=>{
 for(const text of ['10000.5','-1','10e3','99999999999'])assert.equal(C.annual(text,true),null);
 assert.equal(C.annual('1’000',true),1000);assert.equal(C.number('100.1',{max:100}),null);assert.equal(C.number('0,12',{max:100}),.12);assert.equal(C.number(''),null);
});
test('zero turnover and positive transaction counts cannot pass validation',()=>{
 const kinds=[{share:'50',tx:'500'},{share:'50',tx:'500'},{share:'0',tx:'0'}];assert.equal(C.transactionMix(kinds,1000),true);
 kinds[0].tx='400';kinds[2].tx='100';assert.equal(C.transactionMix(kinds,1000),false);
 kinds[0].tx='0';kinds[1].tx='1000';kinds[2].tx='0';assert.equal(C.transactionMix(kinds,1000),false);
 kinds[0].tx='500.5';kinds[1].tx='499.5';assert.equal(C.transactionMix(kinds,1000),false);
});
test('quote assumptions require valid active percentage and CHF fixed fee inputs',()=>{
 const kinds=[{id:'mcDebit',share:'100',ic:'.2',scheme:'.12'}];const o={model:'icpp',assumptionsMode:'quote',cardAssumptions:{mcDebit:{ic:'0.1',scheme:'0.05',icFixed:'0.02',schemeFixed:'0.03'}}};
 assert.equal(C.validAssumptions(o,kinds),true);o.cardAssumptions.mcDebit.scheme='';assert.equal(C.validAssumptions(o,kinds),false);o.cardAssumptions.mcDebit.scheme='0.1';o.cardAssumptions.mcDebit.schemeFixed='-1';assert.equal(C.validAssumptions(o,kinds),false);
});
