(()=>{'use strict';
const $=id=>document.getElementById(id),I=window.PaymentI18n,M=window.PCCMarkups,C=window.PCCCore,T=(key,vars)=>I.t(key,vars);
const fmt=(v,d=0)=>new Intl.NumberFormat(I.locale,{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
const chf=v=>`CHF ${fmt(v,2)}`;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>C.number(v);
const exampleKinds=[
  {id:'mcDebit',tx:'',share:'30',ic:'0.20',scheme:'0.12'},
  {id:'visaDebit',tx:'',share:'30',ic:'0.20',scheme:'0.12'},
  {id:'credit',tx:'',share:'25',ic:'0.40',scheme:'0.15'},
  {id:'twint',tx:'',share:'15',ic:'',scheme:''},
  {id:'other',tx:'',share:'0',ic:'1.50',scheme:'0.70'}
];
const kinds=exampleKinds.map(k=>({...k}));
const groups=kinds.map(k=>k.id);
const mixLogos={mcDebit:['master'],visaDebit:['visa','v_pay'],credit:['visa','master'],twint:['twint'],other:['jcb','diners_club','american_express','unionpay']};
const logoNames={master:'Mastercard',visa:'Visa',v_pay:'V PAY',twint:'TWINT',jcb:'JCB',diners_club:'Diners Club',american_express:'American Express',unionpay:'UnionPay'};

const mode='competitor';let demo=false,txMixEnabled=false,calculationReady=false,pricingChecked=false,exampleUntouched=false;
const make=(provider='Nexi')=>({cardMarkup:M.make(),assumptionsMode:'shared',cardAssumptions:Object.fromEntries(groups.filter(g=>g!=='twint').map(g=>[g,{ic:'',scheme:'',icFixed:'',schemeFixed:''}])),minimumAnnual:'',transactionMinimum:'',name:'',nameEdited:false,provider,model:'split',rates:Object.fromEntries(groups.map(k=>[k,''])),fixed:Object.fromEntries(groups.map(k=>[k,''])),rate:'',rent:'',terminals:'',monthly:'',annual:'',setup:'',minimum:'',surcharge:''});
const nexi=[make()],competitor=make('competitor');
const offers=()=>[nexi[0],competitor];
const competitorName=()=>{const selected=$('competitor-provider')?.value;return (selected==='Other'?$('other-provider')?.value.trim():selected)||T('competitor');};
const name=o=>o.name.trim()||T(o===competitor?'defaultName4':'defaultName1');
const example=value=>T('example',{value});
const hint=key=>{const [type,group]=key.split(':');if(['share','ic','scheme'].includes(type))return exampleKinds[+group][type];if(type==='fixed')return '0.05';if(type==='rate'&&group)return group==='twint'?'1.25':group==='credit'?'1.40':'1.20';return ({rate:'0.45',rent:'25',terminals:'1',monthly:'10',annual:'100',setup:'100',minimum:'20',surcharge:'0.10'})[key]||'0';};
const field=(label,key,value,unit,step='0.01')=>`<label>${esc(label)}<span class="control"><input data-key="${key}" type="number" min="0" step="${step}" inputmode="decimal" value="${esc(value)}" placeholder="${esc(example(hint(key)))}"><b>${esc(unit)}</b></span></label>`;

const shareField=(k,i)=>field(T('Umsatzanteil'),`share:${i}`,k.share,'%','0.1').replace('<span class="control">',`<span class="share-controls"><span class="share-logo-tile">${mixLogos[k.id].map(brand=>`<img src="payment-logos/${brand}.svg" alt="${logoNames[brand]}" width="38" height="24">`).join('')}</span><span class="control">`).replace('</span></label>','</span></span></label>');
function renderMix(){
  $('mix').innerHTML=kinds.map((k,i)=>`<div class="mix-row"><strong>${esc(T(k.id))}</strong>${shareField(k,i)}${k.id==='twint'?`<span class="mix-note">${T('noInterchange')}</span>`:field(T('Interchange'),`ic:${i}`,k.ic,'%','0.001')+field(T('Scheme Fee'),`scheme:${i}`,k.scheme,'%','0.001')}</div>`).join('');
  $('mix').oninput=e=>{const [key,i]=(e.target.dataset.key||'').split(':');if(key){kinds[+i][key]=e.target.value;calculate();}};
  $('tx-mix').innerHTML=kinds.map((k,i)=>`<label>${esc(T(k.id))}<span class="control"><input data-tx="${i}" type="number" min="0" step="1" inputmode="numeric" value="${esc(k.tx)}" placeholder="${esc(example(String([3000,3000,2500,1500,0][i])))}"><b>TRX</b></span></label>`).join('');
  $('tx-mix').oninput=e=>{if(e.target.dataset.tx!=null){kinds[+e.target.dataset.tx].tx=e.target.value;calculate();}};
}
function splitFields(o){return `<div class="split-prices"><p class="subtle">${T('splitIntro')}</p><div class="fields split-grid">${kinds.filter(k=>k.id!=='other').map(k=>field(T(k.id),`rate:${k.id}`,o.rates[k.id],'%','0.001')).join('')}</div><details class="secondary-fees"><summary>${T('moreCards')}</summary><div class="fields">${field(T('moreCardsRate'),'rate:other',o.rates.other,'%','0.001')}${kinds.map(k=>field(T('fixedLabel',{name:T(k.id)}),`fixed:${k.id}`,o.fixed[k.id],'CHF')).join('')}</div><p class="subtle">${T('fixedHint')}</p></details></div>`;}
function quoteAssumptions(o){return `<details class="quote-assumptions"><summary>${T('quoteAssumptions')}</summary><label class="quote-mode"><input type="checkbox" data-assumptions ${o.assumptionsMode==='quote'?'checked':''}> ${T('useQuoteAssumptions')}</label>${o.assumptionsMode==='quote'?kinds.filter(k=>k.id!=='twint').map(k=>`<h4>${esc(T(k.id))}</h4><div class="fields">${['ic','scheme','icFixed','schemeFixed'].map(key=>field(T(({ic:'Interchange',scheme:'Scheme Fee',icFixed:'icFixed',schemeFixed:'schemeFixed'})[key]),`assumption:${k.id}:${key}`,o.cardAssumptions[k.id][key],key.endsWith('Fixed')?'CHF':'%','0.000001')).join('')}</div>`).join(''):''}<p class="subtle">${T('quoteHelp')}</p></details>`;}
function icFields(o){return `<div class="fields card-primary">${field(T('markupLabel'),'rate',o.rate,'%','0.001')}${field(T('twintRate'),'rate:twint',o.rates.twint,'%','0.001')}</div><p class="model-explain">${T('icHelp')}</p><details class="secondary-fees"><summary>${T('fixedSummary')}</summary><div class="fields">${kinds.map(k=>field(T('fixedLabel',{name:T(k.id)}),`fixed:${k.id}`,o.fixed[k.id],'CHF')).join('')}</div></details>`;}
function card(o,i){const rival=o===competitor;return `<article class="offer ${rival?'competitor':''}" data-index="${i}"><div class="offer-heading"><span class="provider-tag">${rival?T('competitor'):'NEXI'}</span></div><label>${T('nameLabel')}<input class="plain" data-key="name" maxlength="60" value="${esc(o.name)}" placeholder="${esc(example(T(rival?'defaultName4':'defaultName1')))}"></label><div class="model-toggle" role="group" aria-label="${esc(name(o))}"><button type="button" data-model="split" aria-pressed="${o.model==='split'}">Split Blend</button><button type="button" data-model="icpp" aria-pressed="${o.model==='icpp'}">IC++</button></div>${o.model==='split'?splitFields(o):icFields(o)+quoteAssumptions(o)}<div class="rent-field">${field(T('rentLabel'),'rent',o.rent,'CHF')}</div><details class="cost-details"><summary>${T('moreCosts')} <span>${T('optional')}</span></summary><div class="fields">${field(T('terminals'),'terminals',o.terminals,T('pieces'),'1')}${field(T('months'),'monthly',o.monthly,'CHF')}${field(T('annual'),'annual',o.annual,'CHF')}${field(T('setupLabel'),'setup',o.setup,'CHF')}${field(T('surcharge'),'surcharge',o.surcharge,'%','0.001')}${field(T('minLabel'),'minimum',o.minimum,'CHF')}${field(T('transactionMinimum'),'transactionMinimum',o.transactionMinimum,'CHF')}${field(T('minimumAnnual'),'minimumAnnual',o.minimumAnnual,'CHF')}</div><p class="subtle">${T('minimumHelp')}</p></details><div class="offer-total" id="total-${i}"></div></article>`;}
function renderOffers(){
  
  $('offers').innerHTML=offers().map(card).join('');
  $('offers').querySelectorAll('.offer').forEach((node,i)=>{const o=offers()[i];node.addEventListener('input',e=>{const key=e.target.dataset.key;if(!key)return;if(key.startsWith('assumption:')){const [,group,part]=key.split(':');o.cardAssumptions[group][part]=e.target.value;}else if(key.includes(':')){const [type,k]=key.split(':');o[type==='rate'?'rates':'fixed'][k]=e.target.value;}else{if(key==='name')o.nameEdited=true;o[key]=e.target.value;}calculate();});node.addEventListener('change',e=>{if(e.target.hasAttribute('data-assumptions')){o.assumptionsMode=e.target.checked?'quote':'shared';renderOffers();document.querySelectorAll('.offer')[i].querySelector('.quote-assumptions').open=true;calculate();}});node.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{invalidatePricing();o.model=b.dataset.model;if(o.model==='icpp'&&['nexi','worldline'].includes(o.cardMarkup.mode))o.cardMarkup.mode='';renderOffers();M.render(offers(),calculate);calculate();});});
}
function context(){const c={volume:C.annual($('volume').value),tx:C.annual($('tx').value,true),years:1};c.share=kinds.reduce((a,k)=>a+(num(k.share)||0),0);c.mixValid=Math.abs(c.share-100)<.001&&kinds.every(k=>(k.share===''||C.number(k.share,{max:100})!==null));return c;}
function cost(o,c,v=c.volume){const tx=v*c.tx/c.volume,blocks=Object.fromEntries(kinds.map(k=>[k.id,{share:(+k.share)/100,volume:v*(+k.share)/100,tx:txMixEnabled?(+k.tx)*v/c.volume:tx*(+k.share)/100}]));let acquiring=0,interchange=0,scheme=0,twint=0;for(const k of kinds){const b=blocks[k.id];if(k.id==='twint'){twint=b.volume*(+o.rates.twint)/100+b.tx*(+o.fixed.twint);continue;}const base=o.model==='split'?+o.rates[k.id]:+o.rate;acquiring+=b.volume*base/100+b.tx*(+o.fixed[k.id]);if(o.model==='icpp'){const a=C.assumptions(o,k);interchange+=b.volume*a.ic/100+b.tx*a.icFixed;scheme+=b.volume*a.scheme/100+b.tx*a.schemeFixed;}}const min=C.minimum(o),extra=v*(+o.surcharge)/100,terminal=12*(+o.rent)*(+o.terminals),other=12*(+o.monthly)+(+o.annual),setup=(+o.setup);const markups=M.cost(o,v);return {acquiring,interchange,scheme,twint,min,extra,terminal,other,setup,...markups,total:acquiring+interchange+scheme+twint+min+extra+terminal+other+setup+markups.cardMarkups};}
function validOffer(o){
 const optional=['rent','terminals','monthly','annual','setup','minimum','minimumAnnual','transactionMinimum','surcharge'];
 if(!o.name.trim()||optional.some(k=>o[k]!==''&&C.number(o[k],{max:k==='surcharge'?100:1e12})===null)||!Number.isSafeInteger(+o.terminals)||+o.terminals>100000||(+o.rent>0&&!(+o.terminals>0))||!C.validMinimum(o)||!C.validAssumptions(o,kinds))return false;
 return kinds.every(k=>{const rate=o.model==='split'||k.id==='twint'?o.rates[k.id]:o.rate;return (rate===''||C.number(rate,{max:100})!==null)&&(o.fixed[k.id]===''||num(o.fixed[k.id])!==null)&&(+k.share<=0||C.number(rate,{max:100})!==null);});
}
function invalidatePricing(){pricingChecked=false;exampleUntouched=false;}

function calculate(){
  if($('submission'))$('submission').hidden=mode!=='competitor';if($('competitor-context'))$('competitor-context').hidden=mode!=='competitor';
  competitor.selectedProvider=$('competitor-provider')?.value||'';
  const c=context(),current=offers(),usesIc=current.some(o=>o.model==='icpp'),markupState=M.validate(kinds,current);$('card-features-error').textContent=markupState.error;document.querySelectorAll('[data-card-provider-label]').forEach(el=>el.textContent=el.dataset.cardProviderLabel==='0'?'Nexi':competitorName());
  $('mix-status').textContent=T('activeShare',{share:fmt(c.share,1)});
  $('mix-preview').innerHTML=kinds.map(k=>`<div class="mix-tile"><span class="mix-tile-label">${esc(T(k.id))}</span><b>${k.share===''?'–':fmt(+k.share,1)} %</b><div class="mix-logos">${mixLogos[k.id].map(brand=>`<img src="payment-logos/${brand}.svg" alt="${logoNames[brand]}" width="38" height="24">`).join('')}</div></div>`).join('');
  $('mix-error').textContent=c.mixValid?'':T('invalidMix');
  c.txMixValid=!txMixEnabled||C.transactionMix(kinds,c.tx);
  $('tx-mix-error').textContent=c.txMixValid?'':T('invalidTx',{tx:fmt(c.tx||0)});
  $('ticket').textContent=c.volume>0&&c.tx>0?T('ticket',{value:chf(c.volume/c.tx)}):'';
  const ready=!!$('channel')?.value&&c.volume>0&&c.tx>0&&Number.isInteger(c.tx)&&Number.isInteger(c.years)&&c.years>=1&&c.years<=10&&c.mixValid&&c.txMixValid&&markupState.valid&&current.every(validOffer)&&current.every(o=>Number.isFinite(cost(o,c).total)&&cost(o,c).total<=C.limits.money);
  calculationReady=ready;$('message').hidden=ready;$('result').hidden=!ready;$('print').disabled=false;
  if(!ready){$('message').textContent=!$('channel')?.value?T('requiredChannel'):c.volume===null||c.tx===null?T('annualInvalid'):!c.mixValid||!c.txMixValid?T('inputMix'):!markupState.valid?markupState.error:current.some(o=>!C.validMinimum(o))?T('minimumRequired'):T('inputRates');current.forEach((o,i)=>{$(`total-${i}`).textContent=T('pendingCost');});return;}
  const ranked=current.map((o,i)=>({o,i,r:cost(o,c)})).sort((a,b)=>a.r.total-b.r.total);
  current.forEach((o,i)=>{$(`total-${i}`).innerHTML=`<span>${T('annualCost')}</span><strong>${chf(cost(o,c).total)}</strong>`;});
  const difference=cost(competitor,c).total-cost(nexi[0],c).total;
  const tied=Math.abs(difference)<.005,cheaper=difference>0;
  const lang=['de','fr','en','it'].indexOf(I.lang);
  const heading=tied?['Kein Preisunterschied','Aucune différence de prix','No price difference','Nessuna differenza di prezzo'][lang]:cheaper?['Dein jährlicher Preisvorteil mit Nexi','Votre avantage annuel avec Nexi','Your annual price advantage with Nexi','Il tuo vantaggio annuo con Nexi'][lang]:['Deine jährlichen Mehrkosten mit Nexi','Votre surcoût annuel avec Nexi','Your annual additional cost with Nexi','Il tuo costo annuo aggiuntivo con Nexi'][lang];
  const period=tied?['Gleiche Jahreskosten','Coûts annuels identiques','Equal annual costs','Costi annui uguali'][lang]:cheaper?['günstiger pro Jahr','moins cher par an','less per year','in meno all’anno'][lang]:['teurer pro Jahr','plus cher par an','more per year','in più all’anno'][lang];
  const hero=document.querySelector('.hero-result');hero.dataset.priceStatus=tied?'equal':cheaper?'cheaper':'costlier';
  hero.innerHTML=`<div class="difference-copy"><span class="difference-heading">${esc(heading)}</span><strong id="winner">${chf(tied?0:Math.abs(difference))}</strong><span id="saving">${esc(period)}</span><p class="difference-context">${esc(name(nexi[0]))} / ${esc(name(competitor))}<br>${esc(['Bei den eingegebenen Preisen und Annahmen.','Selon les prix et hypothèses saisis.','Based on the entered prices and assumptions.','In base ai prezzi e alle ipotesi inseriti.'][lang])}</p></div><span class="price-status-icon" role="img" aria-label="${esc(period)}">${tied?'=':`${cheaper?'<svg class="status-check-vector" viewBox="0 0 46 46" aria-hidden="true"><path d="M7 25 L20 37 L43 11"/></svg>':'<span class="status-cross" aria-hidden="true"></span>'}`}</span>`;
  const max=Math.max(1,...ranked.map(x=>x.r.total));
  $('ranking').innerHTML=ranked.map((x,i)=>`<div class="rank"><div class="rank-line"><div><b>${esc(name(x.o))}</b><small>${esc(x.o===competitor?competitorName():'Nexi')} · ${x.o.model==='icpp'?'IC++':'Split Blend'}</small></div><strong>${T('rankCost',{cost:chf(x.r.total)})}</strong></div><div class="bar-bg"><div class="bar ${i?'secondary':''}" style="width:${Math.max(2,x.r.total/max*100)}%"></div></div></div>`).join('');
  const rows=[['acquiring','acquiring'],['Interchange','interchange'],['scheme','scheme'],['minimum','min'],['extra','extra'],['terminal','terminal'],['otherCost','other'],['setup','setup'],['total','total']];
  rows.splice(3,0,['twint','twint']);if(M.active())rows.splice(4,0,[M.t('cost'),'cardMarkups']);
  $('breakdown').innerHTML=`<div class="table-wrap"><table><thead><tr><th>${T('costHeader')}</th>${ranked.map(x=>`<th>${esc(name(x.o))}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,k])=>`<tr><td>${label===M.t('cost')?esc(label):T(label)}</td>${ranked.map(x=>`<td>${chf(x.r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>${T('appliedRates')}</h4><div class="table-wrap"><table><thead><tr><th>${T('shareRate')}</th>${ranked.map(x=>`<th>${esc(name(x.o))}</th>`).join('')}</tr></thead><tbody>${kinds.map(k=>`<tr><td>${T('shareRow',{name:esc(T(k.id)),share:fmt(+k.share,1)})}</td>${ranked.map(x=>`<td>${x.o.model==='icpp'&&k.id!=='twint'?T('markup',{rate:fmt(+x.o.rate,3)}):`${fmt(+x.o.rates[k.id]||0,3)} %`}${+x.o.fixed[k.id]?T('rateFixed',{amount:chf(+x.o.fixed[k.id])}):''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  if(M.active())$('breakdown').innerHTML+=`<h4>${esc(M.t('cost'))}</h4><div class="table-wrap"><table><thead><tr><th>${esc(M.t('title'))}</th>${ranked.map(x=>`<th>${esc(name(x.o))}</th>`).join('')}</tr></thead><tbody>${M.keys.filter(k=>M.number(M.shares[k])>0).map(k=>`<tr><td>${esc(M.t(k))} · ${esc(M.shares[k])} %</td>${ranked.map(x=>{const d=x.r.cardMarkupDetails.find(d=>d.key===k);return `<td>${fmt(d.rate,3)} % · ${chf(d.amount)}</td>`;}).join('')}</tr>`).join('')}</tbody></table></div>`;
  const hasMinimum=current.some(o=>+o.minimum>0||+o.transactionMinimum>0||+o.minimumAnnual>0);
  const sampled=[.25,.5,.75,1,1.5,2,3,5].map(k=>Math.max(1000,Math.round(c.volume*k/1000)*1000)),switches=sampled.map(v=>({v,o:[...current].sort((a,b)=>cost(a,c,v).total-cost(b,c,v).total)[0]})).filter((x,i,a)=>!i||x.o!==a[i-1].o);
  $('thresholds').innerHTML=hasMinimum?`<p class="subtle">${T('minimumScenario')}</p>`:`<p class="subtle">${T('scenarioIntro')}</p><div class="threshold-list">${switches.map(x=>`<div class="threshold"><span>${T('scenarioAt',{volume:chf(x.v)})}</span><strong>${esc((()=>{const sorted=[...current].sort((a,b)=>cost(a,c,x.v).total-cost(b,c,x.v).total);return Math.abs(cost(sorted[1],c,x.v).total-cost(sorted[0],c,x.v).total)<.005?['Gleiche Gesamtkosten','Coûts totaux identiques','Equal total costs','Costi totali uguali'][['de','fr','en','it'].indexOf(I.lang)]:name(x.o);})())}</strong></div>`).join('')}</div><p class="footnote">${T('scenarioNote')}</p>`;
  const mix=kinds.map(k=>`${T(k.id)} ${k.share} %${txMixEnabled?` / ${k.tx} Tx`:''}`).join('; ');
  $('print-basis').textContent=T('printBasis',{volume:chf(c.volume),tx:fmt(c.tx),years:c.years,mix});
  $('limits').textContent=T('breakdownDate',{date:new Intl.DateTimeFormat(I.locale).format(new Date()),demo:demo?T('exampleCaveat'):'',tx:T(txMixEnabled?'transactionActual':'transactionAssumed'),mix:'',ic:usesIc?T('icNote')+' ':'',limits:T('limitations')});
}
function refreshLanguage(code){I.setLang(code);I.staticText();$('language-code').textContent=I.lang.toUpperCase();$('language-heading').textContent=T('languageHeading');$('language-trigger').setAttribute('aria-label',T('languageTrigger'));document.querySelector('.language-close').setAttribute('aria-label',T('languageClose'));document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===I.lang)));$('demo').textContent=T(demo?'demoLoaded':'demoButton');$('mode-help').textContent='';renderMix();renderOffers();M.render(offers(),calculate);calculate();}
const languageTrigger=$('language-trigger'),languageMenu=$('language-menu'),languageClose=document.querySelector('.language-close');
function closeLanguage(restoreFocus=false){languageMenu.hidden=true;languageTrigger.setAttribute('aria-expanded','false');document.body.classList.remove('language-open');languageMenu.setAttribute('aria-modal','false');if(restoreFocus)languageTrigger.focus();}
function openLanguage(){languageMenu.hidden=false;languageTrigger.setAttribute('aria-expanded','true');document.body.classList.add('language-open');languageMenu.setAttribute('aria-modal',String(matchMedia('(max-width: 600px)').matches));languageMenu.querySelector('[aria-pressed="true"]').focus();}
languageTrigger.onclick=()=>languageMenu.hidden?openLanguage():closeLanguage(true);
languageClose.onclick=()=>closeLanguage(true);
languageMenu.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>{refreshLanguage(button.dataset.language);closeLanguage(true);});
document.addEventListener('pointerdown',e=>{if(!languageMenu.hidden&&!e.target.closest('.language-control'))closeLanguage();});
document.addEventListener('keydown',e=>{if(languageMenu.hidden)return;if(e.key==='Escape'){e.preventDefault();closeLanguage(true);}if(e.key==='Tab'&&matchMedia('(max-width: 600px)').matches){const focusable=[languageClose,...languageMenu.querySelectorAll('[data-language]')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});

$('demo').onclick=()=>{
 $('volume').value='500’000';$('tx').value='10’000';
 kinds.forEach((k,i)=>Object.assign(k,exampleKinds[i],{tx:String([3000,3000,2500,1500,0][i])}));
 for(const [o,base] of [[nexi[0],1.2],[competitor,1.35]]){
  if(!o.name.trim())o.name=T(o===competitor?'defaultName4':'defaultName1');
  for(const key of ['monthly','annual','setup','minimum','minimumAnnual','transactionMinimum','surcharge'])o[key]='0';
  o.assumptionsMode='shared';o.fixed=Object.fromEntries(groups.map(g=>[g,'0']));o.terminals='1';
  o.rates.mcDebit=String(base);o.rates.visaDebit=String(base);o.rates.credit=String(base+0.2);o.rates.twint='1.25';o.rates.other='0';o.rate='0.45';o.rent='25';
 }
 demo=true;pricingChecked=false;exampleUntouched=true;renderMix();renderOffers();M.render(offers(),calculate);calculate();$('demo').textContent=T('demoLoaded');
};

['volume','tx'].forEach(id=>{const input=$(id);input.addEventListener('input',()=>{input.setAttribute('aria-invalid',String(C.annual(input.value,id==='tx')===null));calculate();});input.addEventListener('blur',()=>{input.value=C.formatAnnual(input.value,id==='tx');});});
for(const event of ['input','change'])document.addEventListener(event,e=>{if(e.target.id!=='pricing-confirm'&&e.target.closest('#offers,#mix,#tx-mix,#card-features,.basis-fields,.tx-toggle,#customer-name,#account-id,#opportunity-id,#quote-date')){invalidatePricing();if(e.target.dataset.key!=='minimumAnnual'){offers().forEach((o,i)=>{if(+o.minimum>0||+o.transactionMinimum>0||['minimum','transactionMinimum'].includes(e.target.dataset.key)){o.minimumAnnual='';const input=document.querySelectorAll('.offer')[i]?.querySelector('[data-key=minimumAnnual]');if(input)input.value='';}});}}},true);

$('tx-mix-toggle').onchange=e=>{txMixEnabled=e.target.checked;$('tx-mix').hidden=!txMixEnabled;calculate();};
window.PCCCalculator={refresh:calculate,

 refreshProvider(){competitor.selectedProvider=$('competitor-provider')?.value||'';M.render(offers(),calculate);calculate();},
 clearCompetitorMarkups(){invalidatePricing();competitor.selectedProvider=$('competitor-provider')?.value||'';competitor.cardMarkup=M.make();M.render(offers(),calculate);calculate();},
 reset(){location.reload();},
 snapshot(){const c=context();return {ready:calculationReady,demo,volume:c.volume,tx:c.tx,years:c.years,txMixEnabled,transactions:Object.fromEntries(kinds.map(k=>[k.id,txMixEnabled?+k.tx:c.tx*(+k.share)/100])),mode,pricingConfirmed:pricingChecked,exampleUntouched,cardFeatures:M.snapshot(offers()),effectiveAssumptions:offers().map(o=>Object.fromEntries(kinds.filter(k=>k.id!=='twint').map(k=>[k.id,C.assumptions(o,k)]))),results:calculationReady?offers().map(o=>({name:name(o),provider:o===competitor?'competitor':'Nexi',...cost(o,c)})):[],
 mix:Object.fromEntries(kinds.map(k=>[k.id,+k.share])),
 assumptions:Object.fromEntries(kinds.filter(k=>k.id!=='twint').map(k=>[k.id,{ic:num(k.ic),scheme:num(k.scheme)}])),
 offers:offers().map(o=>({...o,name:name(o),provider:o===competitor?'competitor':'Nexi',rates:Object.fromEntries(groups.map(g=>[g,o.rates[g]===''?null:+o.rates[g]])),fixed:Object.fromEntries(groups.map(g=>[g,+o.fixed[g]])),...Object.fromEntries(['rate','rent','terminals','monthly','annual','setup','minimum','minimumAnnual','transactionMinimum','surcharge'].map(k=>[k,o[k]===''?(k==='rate'?null:0):+o[k]]))}))};}
};
I.setLang('de');I.staticText();renderMix();renderOffers();refreshLanguage('de');
})();
