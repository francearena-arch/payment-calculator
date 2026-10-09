export const industries=['Gastro','Hospitality','Beauty & Cosmetics','Health Services','Specialty Retail','Other','Unknown'];
export const channels=['Remote Sales','Field Sales','Key Account'];
export const competitors=['Worldline','Wallee','Planet/Datatrans','Adyen','Stripe','Payrexx','SumUp','SwiPay','Privapay','Other'];
export const groups=['mcDebit','visaDebit','credit','twint','other'];
export const bands=['<250k','250k–500k','500k–1m','1m–2m','≥2m'];
export const band=v=>v<250000?bands[0]:v<500000?bands[1]:v<1000000?bands[2]:v<2000000?bands[3]:bands[4];
const text=(s,max=80)=>{if(typeof s!=='string'||!s.trim()||s.length>max||/[<>\r\n]/.test(s))throw Error('Invalid text');return s.trim();};
const number=(v,max=100)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0||v>max)throw Error('Invalid number');return v;};
export function validateSubmission(b,today=new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date())){
 if(!industries.includes(b.industry))throw Error('Industry required');
 if(!channels.includes(b.channel)||!['acquisition','retention'].includes(b.purpose)||!bands.includes(b.turnover_band))throw Error('Invalid context');
 if(b.real_quote!==true||b.demo!==false||b.mix_confirmed!==true)throw Error('Real quote and checked mix required');
 if(typeof b.quote_date!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(b.quote_date)||new Date(b.quote_date+'T12:00:00Z').toISOString().slice(0,10)!==b.quote_date||b.quote_date>today)throw Error('Invalid quote date');
 if(!competitors.includes(b.competitor))throw Error('Invalid competitor');
 const competitor=b.competitor==='Other'?text(b.other_competitor,60):b.competitor;
 const mix=Object.fromEntries(groups.map(g=>[g,number(b.mix?.[g])]));
 if(Math.abs(Object.values(mix).reduce((a,v)=>a+v,0)-100)>.001)throw Error('Mix must total 100');
 const assumptions=Object.fromEntries(groups.filter(g=>g!=='twint').map(g=>[g,{ic:number(b.assumptions?.[g]?.ic),scheme:number(b.assumptions?.[g]?.scheme)}]));
 if(!Array.isArray(b.offers)||b.offers.length<2||b.offers.length>4)throw Error('Invalid offers');
 const offers=b.offers.map(o=>{
  if(!['split','icpp'].includes(o.model)||!['Nexi','competitor'].includes(o.provider))throw Error('Invalid model');
  const rates=Object.fromEntries(groups.map(g=>[g,o.rates?.[g]===null?null:number(o.rates?.[g])]));
  const fixed=Object.fromEntries(groups.map(g=>[g,number(o.fixed?.[g],1000)]));
  for(const g of groups)if(mix[g]>0){if((o.model==='split'||g==='twint')&&rates[g]===null)throw Error('Active rate missing');if(o.model==='icpp'&&g!=='twint'&&o.rate===null)throw Error('Markup missing');}
  const result={name:text(o.name,60),provider:o.provider,model:o.model,rates,fixed,rate:o.rate===null?null:number(o.rate)};
  for(const k of ['rent','monthly','annual','setup','minimum'])result[k]=number(o[k],10000000);
  result.terminals=number(o.terminals,10000);if(!Number.isInteger(result.terminals))throw Error('Invalid terminals');
  result.surcharge=number(o.surcharge);
  return result;
 });
 if(offers.filter(o=>o.provider==='competitor').length!==1)throw Error('Exactly one competitor required');
 return {industry:b.industry,channel:b.channel,purpose:b.purpose,quote_date:b.quote_date,turnover_band:b.turnover_band,competitor,payload:{version:'4.1.0-rc.1',offers,mix,assumptions}};
}
export function referenceCost(o,volume=500000,tx=10000){
 for(const g of ['mcDebit','visaDebit','credit','twint'])if((o.model==='split'||g==='twint')&&o.rates[g]===null)return null;
 if(o.model==='icpp'&&o.rate===null)return null;
 const shares={mcDebit:.3,visaDebit:.3,credit:.25,twint:.15,other:0};
 const ic={mcDebit:.2,visaDebit:.2,credit:.4,other:1.5},scheme={mcDebit:.12,visaDebit:.12,credit:.15,other:.7};
 let card=0,twint=0;
 for(const g of groups){const v=volume*shares[g],n=tx*shares[g];if(g==='twint')twint=v*o.rates[g]/100+n*o.fixed[g];else card+=v*(o.model==='split'?o.rates[g]:o.rate+ic[g]+scheme[g])/100+n*o.fixed[g];}
 return Math.max(card,o.minimum*12)+twint+volume*o.surcharge/100+12*o.rent*o.terminals+12*o.monthly+o.annual+o.setup;
}
export const median=a=>{const s=[...a].sort((x,y)=>x-y);return s.length?s.length%2?s[(s.length-1)/2]:(s[s.length/2-1]+s[s.length/2])/2:null;};
