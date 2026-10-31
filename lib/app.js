import {createSendOnce} from './send-once.js';
import {createPdf} from './pdf.js';
import {label,competitors,channels,industries} from './labels.js';
const $=id=>document.getElementById(id);
const I=window.PaymentI18n,calc=window.PCCCalculator;
const L=k=>label(k,I.lang);
const today=()=>new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date());
const hints={'customer-name':'Muster AG','account-id':'001XXXXXXXXXXXXXXX','opportunity-id':'006XXXXXXXXXXXXXXX','other-provider':'Payment Anbieter'};
const field=(id,key,optional=false)=>`<label><span data-label="${key}"></span><input id="${id}" maxlength="${id==='customer-name'?160:80}" ${optional?'':'required'}></label>`;
const select=(id,key,values)=>`<label><span data-label="${key}"></span><select id="${id}" required><option value="" data-label="select"></option>${values.map(v=>`<option value="${v}">${v}</option>`).join('')}</select></label>`;
$('case-context').innerHTML=`<div class="fields">${field('customer-name','customer')}${select('channel','channel',channels)}${field('account-id','account',true)}${field('opportunity-id','opportunity',true)}<label><span data-label="purpose"></span><select id="purpose" required><option value="" data-label="select"></option><option value="acquisition" data-label="acquisition"></option><option value="retention" data-label="retention"></option></select></label>${select('industry','industry',industries)}</div>`;
$('competitor-context').innerHTML=`<div class="fields">${select('competitor-provider','competitor',competitors)}<label id="other-provider-wrap" hidden><span data-label="other"></span><input id="other-provider" maxlength="100"></label><label><span data-label="quoteDate"></span><input id="quote-date" type="date" max="${today()}"></label></div>`;
function comparisonId(){
 if(crypto.randomUUID)return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
let caseId=comparisonId(),busy=false;
let outputSnapshot=null,lastMail=null,pdfCache=null,deliveryEpoch=0;
const metadata=()=>({customerName:$('customer-name').value.trim(),salesforceAccountId:$('account-id').value.trim()||null,salesforceOpportunityId:$('opportunity-id').value.trim()||null,channel:$('channel').value,purpose:$('purpose').value,industry:$('industry').value||null,competitor:$('competitor-provider').value==='Other'?$('other-provider').value.trim():$('competitor-provider').value,quoteDate:$('quote-date').value||null});
function status(message,error=false){$('action-status').textContent=error?message:'';$('action-status').classList.toggle('error',error);}
function language(){for(const [id,value] of Object.entries(hints))$(id).placeholder=['account-id','opportunity-id'].includes(id)?L('optional'):I.t('example',{value});document.querySelectorAll('[data-label]').forEach(el=>el.textContent=L(el.dataset.label));$('export-json').textContent=L('export');$('new-case').textContent=L('reset');$('retry-mail').textContent=L('retryMail');document.querySelector('.choices h2').textContent=L('title');$('mode-help').textContent='';const other=$('competitor-provider').querySelector('[value="Other"]');other.textContent=L('other');}
function validate(){
 const m=metadata(),s=calc.snapshot();
 for(const id of ['customer-name','channel','purpose','competitor-provider',...($('competitor-provider').value==='Other'?['other-provider']:[])]){
  const el=$(id);if(!el.value.trim()){el.setAttribute('aria-invalid','true');el.focus();status(L('required'),true);return false;}el.removeAttribute('aria-invalid');
 }
 if(m.quoteDate&&(!$('quote-date').validity.valid||m.quoteDate>today())){status(L('invalidDate'),true);$('quote-date').focus();return false;}
 if(!s.ready){status(L('required'),true);return false;}return true;
}
function snapshot(){
 const s=calc.snapshot();const value={schemaVersion:'1.2.0',calculatorVersion:'5.5.9',comparisonId:caseId,language:I.lang,currency:'CHF',...metadata(),inputs:{annualVolume:s.volume,annualTransactions:s.tx,oneOffCostYears:s.years,mix:s.mix,transactionMixExplicit:s.txMixEnabled,transactions:s.transactions,assumptions:s.assumptions,effectiveAssumptions:s.effectiveAssumptions,cardFeatures:s.cardFeatures,offers:s.offers},results:s.results,demo:s.demo,pricingConfirmed:s.pricingConfirmed,exampleUntouched:s.exampleUntouched};
 // Preserve the same output timestamp for unchanged PDF and JSON exports.
 const signature=JSON.stringify(value);if(outputSnapshot?.signature===signature)return outputSnapshot.value;
 const result={...value,createdAt:new Date().toISOString()};outputSnapshot={signature,value:result};return result;
}
function download(bytes,name,type){const url=URL.createObjectURL(new Blob([bytes],{type}));const a=document.createElement('a');a.href=url;a.download=name;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);}
const fileBase=s=>`Nexi-Vergleich-${s.comparisonId}`;
const sendOnce=createSendOnce();
$('export-json').onclick=()=>exportComparison('json');
async function emailPdf(bytes,s){
 const epoch=++deliveryEpoch;lastMail={bytes,s};$('retry-mail').hidden=true;
 const data=new FormData();data.set('pdf',new Blob([bytes],{type:'application/pdf'}),fileBase(s)+'.pdf');data.set('comparisonId',s.comparisonId);data.set('comparison',new Blob([JSON.stringify(s,null,2)],{type:'application/json'}),fileBase(s)+'.json');
 try{
  const hash=await crypto.subtle.digest('SHA-256',bytes);data.set('digest',Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join(''));
  const response=await fetch('/api/send-pdf',{method:'POST',body:data,signal:AbortSignal.timeout(30000)}),result=await response.json().catch(()=>({}));
  if(!response.ok){const config=['configuration','sender_unverified','test_recipient_restricted','authentication'].includes(result.code);status(L(config?'mailConfiguration':'mailFailure'),true);$('retry-mail').hidden=false;return false;}
  status(L('mailAccepted'));
  if(result.emailId&&result.receipt)void pollDelivery(result,epoch);
  return true;
 }catch{status(L('mailFailure'),true);$('retry-mail').hidden=false;return false;}
}
async function pollDelivery(result,epoch){
 for(let attempt=0;attempt<4;attempt++){
  if(attempt)await new Promise(r=>setTimeout(r,2000));if(epoch!==deliveryEpoch)return;
  try{const query=new URLSearchParams({id:result.emailId,receipt:result.receipt});const response=await fetch('/api/mail-status?'+query,{signal:AbortSignal.timeout(6000)}),body=await response.json();if(epoch!==deliveryEpoch)return;
   if(body.state==='delivered'){status(L('mailDelivered'));return;}
   if(body.state==='failed'){status(L('mailFailed'),true);return;}
   if(body.state==='unknown')return;
  }catch{return;}
 }
}
$('retry-mail').onclick=async()=>{if(busy||!lastMail)return;busy=true;$('retry-mail').disabled=true;try{await sendOnce(lastMail.s,()=>emailPdf(lastMail.bytes,lastMail.s));}finally{busy=false;$('retry-mail').disabled=false;}};
$('print').onclick=()=>exportComparison('pdf');
async function exportComparison(format){
 if(busy||!validate())return;busy=true;$('print').disabled=true;$('export-json').disabled=true;$('new-case').disabled=true;status(L('busy'));
 try{
  const s=snapshot(),bytes=pdfCache?.s===s?pdfCache.bytes:await createPdf(s,I,window.PCCMarkups);pdfCache={s,bytes};
  // Safari may navigate away when opening a blob PDF. Finish the mail request first.
  // Preserve the local PDF even when the mail service fails.
  try{const outcome=await sendOnce(s,()=>emailPdf(bytes,s));if(outcome==='already-sent')status(L('mailAccepted'));}finally{if(format==='json')download(JSON.stringify(s,null,2),fileBase(s)+'.json','application/json');else download(bytes,fileBase(s)+'.pdf','application/pdf');}
 }catch{status(L('pdfFailure'),true);}finally{busy=false;$('export-json').disabled=false;$('new-case').disabled=false;calc.refresh();}
};
$('new-case').onclick=()=>{if(confirm(L('resetConfirm')))location.reload();};
let previousProvider;
function providerChanged(){const other=$('competitor-provider').value==='Other';$('other-provider-wrap').hidden=!other;$('other-provider').required=other;const identity=JSON.stringify([$('competitor-provider').value,other?$('other-provider').value.trim():'']);if(previousProvider!==undefined&&previousProvider!==identity)calc.clearCompetitorMarkups();else calc.refreshProvider();previousProvider=identity;}
$('competitor-provider').onchange=providerChanged;$('other-provider').oninput=providerChanged;
$('channel').onchange=()=>calc.refresh();
$('demo').addEventListener('click',()=>{
 const examples={'customer-name':'Muster AG (Beispiel)','account-id':'001000000000001','opportunity-id':'006000000000001',channel:'Remote Sales',purpose:'acquisition',industry:'Gastro','competitor-provider':'Worldline','quote-date':today()};
 for(const [id,value] of Object.entries(examples)){const el=$(id);if(!el.value.trim())el.value=value;el.removeAttribute('aria-invalid');}
 if($('competitor-provider').value==='Other'&&!$('other-provider').value.trim())$('other-provider').value='Beispiel Competitor';
 providerChanged();status('');
});
document.addEventListener('input',()=>{if(busy)$('print').disabled=true;else{deliveryEpoch++;lastMail=null;$('retry-mail').hidden=true;}});
document.addEventListener('change',()=>{if(busy)$('print').disabled=true;});
document.querySelectorAll('[data-language]').forEach(button=>button.addEventListener('click',language));
// Browser restoration must not resurrect a previous customer's values.
window.addEventListener('pageshow',event=>{if(event.persisted)location.reload();});
language();calc.refresh();
