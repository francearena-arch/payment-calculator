window.PCCCore=(()=>{'use strict';
 const limits=Object.freeze({money:1e12,transactions:1e9,percent:100});
 function number(value,{max=limits.money,integer=false,decimals=8}={}){
  if(value==null||String(value).trim()==='')return null;
  if(typeof value==='number')return Number.isFinite(value)&&value>=0&&value<=max&&(!integer||Number.isSafeInteger(value))?value:null;
  const text=String(value).trim(),parts=text.split(/[.,]/);if(parts.length>2)return null;
  if(parts.length===2&&(integer||!/^\d+$/.test(parts[1])||parts[1].length>decimals))return null;
  let whole=parts[0];if(/[’'\s]/.test(whole)){if(!/^\d{1,3}(?:[’'\s]\d{3})+$/.test(whole))return null;whole=whole.replace(/[’'\s]/g,'');}
  if(!/^\d+$/.test(whole))return null;
  const n=Number(whole+(parts.length===2?'.'+parts[1]:''));return Number.isFinite(n)&&n>=0&&n<=max&&(!integer||Number.isSafeInteger(n))?n:null;
 }
 function annual(value,transactions=false){return number(value,{max:transactions?limits.transactions:limits.money,integer:transactions,decimals:transactions?0:2});}
 function formatAnnual(value,transactions=false){if(annual(value,transactions)===null)return String(value);const parts=String(value).trim().replace(/[’'\s]/g,'').replace(',','.').split('.');return parts[0].replace(/\B(?=(\d{3})+(?!\d))/g,'’')+(parts.length===2?'.'+parts[1]:'');}
 function transactionMix(kinds,total){return kinds.every(k=>{const share=number(k.share,{max:100}),tx=number(k.tx,{max:limits.transactions,integer:true});return tx!==null&&(share>0?tx>0:tx===0);})&&kinds.reduce((s,k)=>s+Number(k.tx),0)===total;}
 function assumptions(o,k){const a=o.assumptionsMode==='quote'?o.cardAssumptions?.[k.id]:k;return {ic:Number(a?.ic)||0,scheme:Number(a?.scheme)||0,icFixed:Number(a?.icFixed)||0,schemeFixed:Number(a?.schemeFixed)||0};}
 function validAssumptions(o,kinds){return o.model!=='icpp'||kinds.filter(k=>k.id!=='twint'&&Number(k.share)>0).every(k=>{const a=o.assumptionsMode==='quote'?o.cardAssumptions?.[k.id]:k;return a&&['ic','scheme'].every(key=>number(a[key],{max:100})!==null)&&['icFixed','schemeFixed'].every(key=>a[key]==null||a[key]===''||number(a[key],{decimals:8})!==null);});}
 function minimum(o){return number(o.minimumAnnual)||0;}
 function validMinimum(o){return !(Number(o.minimum)>0||Number(o.transactionMinimum)>0)||number(o.minimumAnnual)!==null;}
 return {limits,number,annual,formatAnnual,transactionMix,assumptions,validAssumptions,minimum,validMinimum};
})();
