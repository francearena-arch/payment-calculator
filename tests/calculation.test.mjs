import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
// Execute the production cost function without a browser or UI-dependent setup.
function fixture(){
 const context={window:{PaymentI18n:{lang:'de'}},txMixEnabled:false,kinds:[
  {id:'mcDebit',share:30,ic:.2,scheme:.12,tx:3000},
  {id:'visaDebit',share:30,ic:.2,scheme:.12,tx:3000},
  {id:'credit',share:25,ic:.4,scheme:.15,tx:2500},
  {id:'twint',share:15,ic:0,scheme:0,tx:1500},
  {id:'other',share:0,ic:1.5,scheme:.7,tx:0}
 ]};vm.createContext(context);vm.runInContext(readFileSync(new URL('../public/markups.js',import.meta.url),'utf8'),context);context.M=context.window.PCCMarkups;
 const source=readFileSync(new URL('../public/calculator.js',import.meta.url),'utf8');const cost=vm.runInContext('('+source.slice(source.indexOf('function cost('),source.indexOf('function validOffer(')).trim()+')',context);
 const offer={provider:'Nexi',name:'Nexi',model:'split',rates:{mcDebit:1.2,visaDebit:1.2,credit:1.4,twint:1.25,other:0},fixed:{mcDebit:0,visaDebit:0,credit:0,twint:0,other:0},rate:.45,rent:25,terminals:1,monthly:0,annual:0,setup:0,minimum:0,surcharge:0,cardMarkup:context.M.make()};
 return {context,cost,offer};
}
test('production annual model adds confirmed markups without changing IC, Scheme Fee or TWINT',()=>{
 const {context,cost,offer}=fixture(),c={volume:500000,tx:10000};assert.equal(cost(offer,c).total,6587.5);
 Object.assign(context.M.shares,{intra:'10',inter:'5',commercial:'3',debitToken:'20'});offer.cardMarkup.mode='nexi';assert.equal(cost(offer,c).total,7867.5);
 offer.model='icpp';offer.cardMarkup.mode='custom';offer.cardMarkup.rates={...context.M.tariff};const r=cost(offer,c);
 assert.equal(r.acquiring,1912.5);assert.equal(r.interchange,1100);assert.equal(r.scheme,547.5);assert.equal(r.twint,937.5);assert.equal(r.cardMarkups,1280);assert.equal(r.total,6077.5);
 assert.equal(cost(offer,c,1000000).cardMarkups,2560);assert.equal(cost(offer,c,1000000).terminal,300);
 context.txMixEnabled=true;offer.fixed.mcDebit=.05;assert.equal(cost(offer,c).total,6227.5);
});
test('1000 independent annual-cost checks across models, minima, fixed fees and markups',()=>{
 const {context,cost,offer}=fixture();let seed=47;const rand=()=>((seed=(seed*1664525+1013904223)>>>0)/4294967296);
 for(let i=0;i<1000;i++){
  const weights=context.kinds.map(()=>rand()),sum=weights.reduce((a,b)=>a+b,0);context.kinds.forEach((k,j)=>Object.assign(k,{share:weights[j]/sum*100,ic:rand()*2,scheme:rand()}));
  const v=1000+rand()*1e7,tx=1+Math.floor(rand()*1e5),c={volume:v,tx};Object.assign(offer,{model:i%2?'icpp':'split',rate:rand()*2,rent:rand()*50,terminals:Math.floor(rand()*5),monthly:rand()*30,annual:rand()*200,setup:rand()*500,minimum:rand()*100,surcharge:rand()});
  offer.cardMarkup.mode='custom';for(const key of context.M.keys){context.M.shares[key]=String(rand()*5);offer.cardMarkup.rates[key]=String(rand()*2);}
  let cards=0,twint=0;for(const k of context.kinds){offer.rates[k.id]=rand()*3;offer.fixed[k.id]=rand()*.2;const volume=v*k.share/100,n=tx*k.share/100;if(k.id==='twint')twint=volume*offer.rates[k.id]/100+n*offer.fixed[k.id];else cards+=volume*(offer.model==='split'?offer.rates[k.id]:offer.rate+k.ic+k.scheme)/100+n*offer.fixed[k.id];}
  const fees=context.M.keys.reduce((total,k)=>total+v*Number(context.M.shares[k])*Number(offer.cardMarkup.rates[k])/10000,0);
  const expected=Math.max(cards,12*offer.minimum)+twint+v*offer.surcharge/100+12*offer.rent*offer.terminals+12*offer.monthly+offer.annual+offer.setup+fees;
  assert.ok(Math.abs(cost(offer,c).total-expected)<1e-7*Math.max(1,expected),'annual case '+i);
 }
});
