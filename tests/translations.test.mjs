import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFileSync} from 'node:fs';
import {industryLabel,industries,label} from '../lib/labels.js';
const languages=['de','fr','en','it'];
function catalog(path,marker){const context={window:{},document:{documentElement:{},title:""}};const source=readFileSync(new URL(path,import.meta.url),'utf8').replace(marker,'window.dictionary=D;'+marker);vm.runInNewContext(source,context);return context.window;}
const i18n=catalog('../public/i18n.js',"  let lang='de';");
const markups=catalog('../public/markups.js',' const t=');
test('all UI and markup translations have complete locales and identical dynamic placeholders',()=>{
 for(const dictionary of [i18n.dictionary,markups.dictionary])for(const [key,values] of Object.entries(dictionary)){
  assert.equal(values.length,4,key);
  const placeholders=text=>Array.from(text.matchAll(/\{(\w+)\}/g),m=>m[1]).sort();
  for(const text of values){assert.equal(typeof text,'string',key);assert.ok(text.trim(),key);assert.deepEqual(placeholders(text),placeholders(values[0]),key);}
 }
 // PDF rendering captures a locale without changing the active browser language.
 i18n.PaymentI18n.setLang('it');const french=i18n.PaymentI18n.forLanguage('fr');
 assert.equal(french.t('rankCost',{cost:'CHF 100'}),'CHF 100 / an');assert.equal(i18n.PaymentI18n.lang,'it');
});
test('industry display translations preserve canonical export values and unknown historical values',()=>{
 assert.deepEqual(industries,['Gastro','Hospitality','Beauty & Cosmetics','Health Services','Specialty Retail','Other']);
 for(const language of languages){for(const value of industries)assert.ok(industryLabel(value,language));assert.equal(industryLabel('Legacy custom sector',language),'Legacy custom sector');}
 assert.equal(industryLabel('Gastro','fr'),'Restauration');assert.equal(industryLabel('Gastro','it'),'Ristorazione');assert.equal(industryLabel('Other','fr'),'Autre secteur');
 for(const language of ['fr','en','it'])for(const key of ['model','difference','exampleData','providerExample'])assert.notEqual(label(key,language),key);
});
