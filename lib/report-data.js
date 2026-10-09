import {competitors,referenceCost,median} from './domain.js';
export const REFERENCE_VERSION='CH-2026-v1';
export const referenceProfiles={
 '<250k':{volume:125000,tx:2500},'250k–500k':{volume:375000,tx:7500},
 '500k–1m':{volume:750000,tx:15000},'1m–2m':{volume:1500000,tx:30000},'≥2m':{volume:2500000,tx:50000}
};
export const rival=r=>r.payload.offers.find(o=>o.provider==='competitor');
export const normalizedCost=(o,r)=>{const ref=referenceProfiles[r.turnover_band];return ref?referenceCost(o,ref.volume,ref.tx):null;};
export const cohortKey=r=>[r.purpose,r.industry||'Unrecorded',r.channel,r.turnover_band,rival(r)?.model].join('|');
export function pairedComparison(r){
 const competitor=normalizedCost(rival(r),r);if(competitor===null)return null;
 let options=r.payload.offers.filter(o=>o.provider==='Nexi');
 if(r.purpose==='retention'){const actual=r.offered_option!=null?r.payload.offers[r.offered_option]:null;if(actual?.provider!=='Nexi')return null;options=[actual];}
 const values=options.map(o=>({o,cost:normalizedCost(o,r)})).filter(x=>x.cost!==null);if(!values.length)return null;
 const chosen=values.sort((a,b)=>a.cost-b.cost)[0];return {name:chosen.o.name,nexi:chosen.cost,competitor,saving:competitor-chosen.cost,advantage:competitor>0?(competitor-chosen.cost)/competitor*100:null};
}
export function rateGroups(rows){
 const map=new Map();for(const r of rows){const o=rival(r);if(!o)continue;const key=[r.competitor,o.model].join('|');if(!map.has(key))map.set(key,{label:r.competitor,model:o.model,rows:[]});map.get(key).rows.push(r);}
 return [...map.values()].sort((a,b)=>a.label.localeCompare(b.label)||a.model.localeCompare(b.model));
}
export const rate=(o,g)=>o.model==='icpp'&&g!=='twint'?o.rate:o.rates[g];
export function monthlyRates(rows,g){const m=new Map();for(const r of rows){const o=rival(r),v=rate(o,g);if(v==null||!Number.isFinite(v))continue;const key=r.competitor+'|'+r.quote_date.slice(0,7);if(!m.has(key))m.set(key,[]);m.get(key).push(v);}return [...m].map(([key,values])=>{const [provider,month]=key.split('|');return {provider,month,n:values.length,value:median(values)};});}
// Deterministic fictitious scenarios. Never passed to the persistence API.
export function createDemoRows(){
 const out=[],brands=[...competitors.filter(c=>c!=='Other'),'Other · DemoPay'];
 const templates=[{purpose:'acquisition',industry:'Gastro',channel:'Field Sales',band:'500k–1m'},
 {purpose:'retention',industry:'Gastro',channel:'Field Sales',band:'500k–1m'},
 {purpose:'acquisition',industry:'Hospitality',channel:'Key Account',band:'≥2m'},
 {purpose:'retention',industry:'Beauty & Cosmetics',channel:'Remote Sales',band:'250k–500k'},
 {purpose:'acquisition',industry:'Health Services',channel:'Remote Sales',band:'<250k'},
 {purpose:'retention',industry:'Specialty Retail',channel:'Key Account',band:'1m–2m'}];
 for(let month=4;month<=9;month++)for(let b=0;b<brands.length;b++)for(let c=0;c<templates.length;c++)for(const model of ['split','icpp'])for(let sample=0;sample<5;sample++){
  const x=templates[c],delta=(month-4)*(b%3===0?-.018:b%3===1?.014:0),base=.65+b*.055+sample*.013+delta;
  const make=(provider,kind,offset=0)=>({provider,name:provider==='Nexi'?'Nexi Standard':'Demo '+brands[b],model:kind,rates:{mcDebit:+(base+offset).toFixed(3),visaDebit:+(base+.08+offset).toFixed(3),credit:+(base+.48+offset).toFixed(3),twint:+(1.1+b*.022+sample*.01+delta/2).toFixed(3),other:+(2.1+b*.025).toFixed(3)},fixed:{mcDebit:.03,visaDebit:.05,credit:0,twint:0,other:0},rate:+(.3+b*.018+sample*.004+delta/2+offset).toFixed(3),rent:15+b*2,terminals:c===2?3:1,monthly:b%3===0?5:0,annual:0,setup:50,minimum:0,surcharge:0});
  const nexi=make('Nexi',model,b%3===1?.06:-.035),second={...make('Nexi',model,b%3===1?.10:.08),name:'Nexi Flex',rent:0},competitor=make('competitor',model);
  const index=out.length;out.push({id:'DEMO-'+index,demo:true,industry:x.industry,channel:x.channel,purpose:x.purpose,quote_date:`2026-${String(month).padStart(2,'0')}-${String(2+sample).padStart(2,'0')}`,turnover_band:x.band,competitor:brands[b],status:'approved',outcome:x.purpose==='retention'?(sample===4?'open':sample===3?'lost':'retained'):'open',offered_option:x.purpose==='retention'?(sample%2):null,payload:{version:'DEMO',demo:true,offers:[nexi,second,competitor],mix:{mcDebit:30,visaDebit:30,credit:25,twint:15,other:0},assumptions:{mcDebit:{ic:.2,scheme:.12},visaDebit:{ic:.2,scheme:.12},credit:{ic:.4,scheme:.15},other:{ic:1.5,scheme:.7}}}});
 }
 return out;
}
