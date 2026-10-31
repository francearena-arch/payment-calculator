import {PDFDocument,StandardFonts,rgb} from 'pdf-lib';
import {label} from './labels.js';
export async function createPdf(s,I,M){
 I=I.forLanguage?I.forLanguage(s.language):I;const MT=key=>M.t(key,s.language);
 const doc=await PDFDocument.create();doc.setTitle('Payment Calculator');doc.setAuthor('Nexi');doc.setCreationDate(new Date(s.createdAt));doc.setModificationDate(new Date(s.createdAt));
 const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const L=k=>label(k,s.language),T=k=>I.t(k),money=n=>'CHF '+new Intl.NumberFormat(I.locale,{minimumFractionDigits:2,maximumFractionDigits:2}).format(n),num=n=>n==null?'-':String(n);
 const color=rgb(.15,.16,.57),gray=rgb(.36,.39,.46);let page,y;
 const clean=text=>Array.from(String(text??'-').replace(/[\r\n\t]/g,' ').replace(/\u202f/g,' ')).map(c=>{try{regular.encodeText(c);return c;}catch{return '?';}}).join('');
 function addPage(){page=doc.addPage([595.28,841.89]);y=766;page.drawText('NEXI',{x:42,y:800,size:18,font:bold,color});page.drawLine({start:{x:42,y:786},end:{x:553,y:786},thickness:1,color:rgb(.85,.87,.93)});}
 function need(h){if(y-h<58)addPage();}
 function lines(text,width,font,size){const out=[];let line='';for(const word of clean(text).split(' ')){const next=line?line+' '+word:word;if(font.widthOfTextAtSize(next,size)<=width){line=next;continue;}if(line)out.push(line);line='';for(const c of word){if(font.widthOfTextAtSize(line+c,size)>width&&line){out.push(line);line='';}line+=c;}}out.push(line);return out;}
 function paragraph(text,{size=10,font=regular,ink=gray}={}){for(const line of lines(text,511,font,size)){need(size+7);page.drawText(line,{x:42,y,size,font,color:ink});y-=size+5;}y-=4;}
 function heading(text){need(48);y-=12;paragraph(text,{size:14,font:bold,ink:color});y-=4;}
 function row(key,value){const a=lines(key,205,regular,9),b=lines(value,286,regular,9),h=Math.max(a.length,b.length)*13+8;need(h);page.drawRectangle({x:42,y:y-h+5,width:511,height:h,color:rgb(.965,.97,.985)});a.forEach((v,i)=>page.drawText(v,{x:49,y:y-i*13-4,size:9,font:regular,color:gray}));b.forEach((v,i)=>page.drawText(v,{x:262,y:y-i*13-4,size:9,font:regular,color:rgb(.12,.14,.22)}));y-=h;}
 addPage();heading(L('title'));paragraph(s.customerName,{size:20,font:bold,ink:color});
 for(const [key,value] of [['id',s.comparisonId],['created',new Date(s.createdAt).toLocaleString(I.locale,{timeZone:'Europe/Zurich'})],['account',s.salesforceAccountId||'-'],['opportunity',s.salesforceOpportunityId||'-'],['channel',s.channel],['purpose',L(s.purpose)],['industry',s.industry||'-'],['competitor',s.competitor],['quoteDate',s.quoteDate||'-']])row(L(key),value);
 heading(L('results'));for(const r of s.results)row(r.name,money(r.total));row('Delta (CHF)',money(Math.abs(s.results[0].total-s.results[1].total)));
 addPage();heading(L('inputs'));row(T('volumeLabel'),money(s.inputs.annualVolume));row(T('txLabel'),num(s.inputs.annualTransactions));row('Demo',L(String(s.demo)));row(T('pricingConfirmation'),L(String(!!s.pricingConfirmed)));
 for(const [g,share] of Object.entries(s.inputs.mix)){row(T(g),`${share} % / ${s.inputs.transactions[g]} Tx`);const a=s.inputs.assumptions[g];if(a)row(T(g)+' - Interchange / Scheme Fee',`${num(a.ic)} % / ${num(a.scheme)} %`);}
 paragraph(T(s.inputs.transactionMixExplicit?'transactionActual':'transactionAssumed'));
 const features=s.inputs.cardFeatures,hasFeatures=features&&Object.values(features.shares).some(v=>v>0);
 if(hasFeatures){heading(MT('title'));paragraph(MT('basis'));for(const key of M.keys)row(MT(key),features.shares[key]==null?MT('notEntered'):num(features.shares[key])+' %');paragraph(MT('overlap'));}

 heading(L('notes'));paragraph(T('limitations'));if(s.inputs.offers.some(o=>o.model==='icpp'))paragraph(T('icNote'));if(s.demo)paragraph(T('exampleCaveat'));
 for(const [index,o] of s.inputs.offers.entries()){
  addPage();heading(o.name);row(L('offer'),o.provider==='Nexi'?'Nexi':s.competitor);row('Model',o.model==='icpp'?'IC++':'Split Blend');if(o.model==='icpp')row(T('markupLabel'),num(o.rate)+' %');
  for(const g of Object.keys(s.inputs.mix))row(T(g),`${o.model==='icpp'&&g!=='twint'?num(o.rate)+' % + IC + Scheme Fee':num(o.rates[g])+' %'} / ${num(o.fixed[g])} CHF/Tx`);
  for(const [key,text] of [['rent','rentLabel'],['terminals','terminals'],['monthly','months'],['annual','annual'],['setup','setupLabel'],['minimum','minLabel'],['transactionMinimum','transactionMinimum'],['minimumAnnual','minimumAnnual'],['surcharge','surcharge']])row(T(text),key==='terminals'?num(o[key]):key==='surcharge'?num(o[key])+' %':money(o[key]));
  if(o.model==='icpp'&&s.inputs.effectiveAssumptions){heading(T('quoteAssumptions'));for(const [g,a] of Object.entries(s.inputs.effectiveAssumptions[index]))row(T(g),`IC ${num(a.ic)} % + ${money(a.icFixed)}/Tx; Scheme Fee ${num(a.scheme)} % + ${money(a.schemeFixed)}/Tx`);paragraph(T('quoteHelp'));}
  if(o.minimum>0||o.transactionMinimum>0)paragraph(T('minimumHelp'));
  const r=s.results[index];
  if(hasFeatures){heading(MT('cost'));const policy=features.offers[index];row(MT('treatment'),MT(['nexi','worldline','custom'].includes(policy.mode)?policy.mode:'included'));if(policy.source)paragraph(policy.source);for(const d of r.cardMarkupDetails.filter(d=>d.share>0))row(MT(d.key),`${d.share} % / ${money(d.volume)} x ${d.rate} % = ${money(d.amount)}`);}
  need(hasFeatures?350:310);heading(L('results'));if(hasFeatures)row(MT('cost'),money(r.cardMarkups));for(const [key,text] of [['acquiring','acquiring'],['interchange','Interchange'],['scheme','scheme'],['twint','twint'],['min','minimum'],['extra','extra'],['terminal','terminal'],['other','otherCost'],['setup','setup'],['total','total']])row(T(text),money(r[key]));
 }

 const pages=doc.getPages();pages.forEach((p,i)=>{p.drawText(`${i+1} / ${pages.length}`,{x:512,y:30,size:8,font:regular,color:gray});p.drawText(s.comparisonId,{x:42,y:30,size:7,font:regular,color:gray});});return doc.save({useObjectStreams:false});
}
