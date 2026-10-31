import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
function fixture(){
 const window={PaymentI18n:{lang:'de'}};vm.runInNewContext(readFileSync(new URL('../public/markups.js',import.meta.url),'utf8'),{window});
 const M=window.PCCMarkups,kinds=[['mcDebit',30],['visaDebit',30],['credit',25],['twint',15],['other',0]].map(([id,share])=>({id,share}));
 const nexi={provider:'Nexi',model:'split',cardMarkup:M.make()},competitor={provider:'competitor',model:'split',cardMarkup:M.make()};
 return {M,kinds,nexi,competitor,offers:[nexi,competitor]};
}
test('empty and explicit zero shares never add costs or demand policies',()=>{
 const {M,kinds,offers,nexi}=fixture();assert.equal(M.validate(kinds,offers).valid,true);assert.equal(M.cost(nexi,500000).cardMarkups,0);
 assert.equal(M.snapshot(offers).shares.intra,null);M.shares.intra='0';assert.equal(M.snapshot(offers).shares.intra,0);assert.equal(M.validate(kinds,offers).valid,true);
});
test('published rates apply once, to explicitly affected turnover, after both contracts are confirmed',()=>{
 const {M,kinds,offers,nexi,competitor}=fixture();Object.assign(M.shares,{intra:'10',inter:'5',commercial:'3',debitToken:'20'});
 assert.equal(M.validate(kinds,offers).valid,false);nexi.cardMarkup.mode='nexi';assert.equal(M.validate(kinds,offers).valid,false);competitor.cardMarkup.mode='included';assert.equal(M.validate(kinds,offers).valid,true);
 const r=M.cost(nexi,500000);assert.equal(r.cardMarkups,1280);assert.deepEqual(Array.from(r.cardMarkupDetails,d=>d.amount),[515,387.5,217.5,160]);assert.equal(M.cost(competitor,500000).cardMarkups,0);assert.equal(M.cost(nexi,1000000).cardMarkups,2560);
 const s=M.snapshot(offers);assert.equal(s.percentBasis,'totalAnnualPaymentTurnoverIncludingTwint');assert.equal(s.offers[0].tariff,'Nexi-CH-2026-05-01');assert.ok(s.offers[0].source.endsWith('CH_DE_KMU_Preisliste_May2026.pdf'));
});
test('Nexi tariff cannot leak to competitor or IC++; custom confirmed rates work independently',()=>{
 const {M,kinds,offers,nexi,competitor}=fixture();M.shares.intra='10';nexi.cardMarkup.mode='nexi';competitor.cardMarkup.mode='nexi';assert.equal(M.validate(kinds,offers).valid,false);assert.equal(M.cost(competitor,500000).cardMarkups,0);
 competitor.cardMarkup.mode='included';nexi.model='icpp';assert.equal(M.validate(kinds,offers).valid,false);assert.equal(M.cost(nexi,500000).cardMarkups,0);
 nexi.cardMarkup.mode='custom';assert.equal(M.validate(kinds,offers).valid,false);nexi.cardMarkup.rates.intra='0,50';assert.equal(M.validate(kinds,offers).valid,true);assert.equal(M.cost(nexi,500000).cardMarkups,250);
 nexi.cardMarkup.mode='included';assert.equal(M.cost(nexi,500000).cardMarkups,0);
});
test('reject malformed percentages, impossible overlaps and incompatible payment mix',()=>{
 const {M,kinds,offers}=fixture();for(const o of offers)o.cardMarkup.mode='included';
 for(const text of ['-1','101','1e2','Infinity','NaN','1.2.3','1,2,3','%',' ']){M.shares.intra=text;assert.equal(M.validate(kinds,offers).valid,false,text);}
 Object.assign(M.shares,{intra:'80',inter:'6'});assert.equal(M.validate(kinds,offers).valid,false);
 Object.assign(M.shares,{intra:'10',inter:'5',commercial:'16'});assert.equal(M.validate(kinds,offers).valid,false);
 Object.assign(M.shares,{commercial:'15',debitToken:'61'});assert.equal(M.validate(kinds,offers).valid,false);
 Object.assign(M.shares,{intra:'80',inter:'0',commercial:'0',debitToken:'6'});assert.equal(M.validate(kinds,offers).valid,false);
 Object.assign(M.shares,{intra:'0',inter:'0',commercial:'0',debitToken:'0'});kinds.find(k=>k.id==='other').share=85;kinds.filter(k=>!['other','twint'].includes(k.id)).forEach(k=>k.share=0);M.shares.intra='1';assert.equal(M.validate(kinds,offers).valid,false);
});
test('500 independent randomized monetary checks for each fee component and scaling',()=>{
 const {M,nexi}=fixture();nexi.cardMarkup.mode='nexi';let seed=9;const random=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<500;i++){
  const v=random()*1e9;Object.assign(M.shares,{intra:String(random()*15),inter:String(random()*10),commercial:String(random()*5),debitToken:String(random()*40)});
  const expected=v*(Number(M.shares.intra)*.0103+Number(M.shares.inter)*.0155+Number(M.shares.commercial)*.0145+Number(M.shares.debitToken)*.0016)/100;
  assert.ok(Math.abs(M.cost(nexi,v).cardMarkups-expected)<1e-7);assert.ok(Math.abs(M.cost(nexi,v*2).cardMarkups-expected*2)<2e-7);
 }
});
