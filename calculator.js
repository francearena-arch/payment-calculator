(()=>{'use strict';
const $=id=>document.getElementById(id),I=window.PaymentI18n,T=(key,vars)=>I.t(key,vars);
const fmt=(v,d=0)=>new Intl.NumberFormat(I.locale,{minimumFractionDigits:d,maximumFractionDigits:d}).format(v);
const chf=v=>`CHF ${fmt(v,2)}`;
const esc=v=>String(v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>{if(v==null||String(v).trim()==='')return null;const x=Number(String(v).replace(/[’'\s]/g,''));return Number.isFinite(x)&&x>=0?x:null;};
const kinds=[
  {id:'mcDebit',tx:'',share:'30',ic:'0.20',scheme:'0.12'},
  {id:'visaDebit',tx:'',share:'30',ic:'0.20',scheme:'0.12'},
  {id:'credit',tx:'',share:'25',ic:'0.40',scheme:'0.15'},
  {id:'twint',tx:'',share:'15',ic:'',scheme:''},
  {id:'other',tx:'',share:'0',ic:'1.50',scheme:'0.70'}
];
const groups=kinds.map(k=>k.id);
let mode='internal2',demo=false,mixConfirmed=false,txMixEnabled=false;
const make=(name,provider='Nexi',model='split')=>({name,nameEdited:false,provider,model,rates:Object.fromEntries(groups.map(k=>[k,''])),fixed:Object.fromEntries(groups.map(k=>[k,'0'])),rate:'',rent:'0',terminals:'1',monthly:'0',annual:'0',setup:'0',minimum:'0',surcharge:'0'});
const nexi=[make('Nexi mit Terminalmiete'),make('Nexi ohne Terminalmiete'),make('Nexi Verbandsangebot','Nexi','icpp')],competitor=make('Angebot des Wettbewerbers','Wettbewerber');
const offers=()=>mode==='competitor'?[nexi[0],competitor]:mode==='internal3'?nexi:nexi.slice(0,2);
const name=o=>o.nameEdited?o.name:T(({ 'Nexi mit Terminalmiete':'defaultName1','Nexi ohne Terminalmiete':'defaultName2','Nexi Verbandsangebot':'defaultName3','Angebot des Wettbewerbers':'defaultName4'})[o.name]||o.name);
const field=(label,key,value,unit,step='0.01')=>`<label>${esc(label)}<span class="control"><input data-key="${key}" type="number" min="0" step="${step}" inputmode="decimal" value="${esc(value)}" placeholder="–"><b>${esc(unit)}</b></span></label>`;
function renderMix(){
  $('mix').innerHTML=kinds.map((k,i)=>`<div class="mix-row"><strong>${esc(T(k.id))}</strong>${field(T('Umsatzanteil'),`share:${i}`,k.share,'%','0.1')}${k.id==='twint'?`<span class="mix-note">${T('noInterchange')}</span>`:field(T('Interchange'),`ic:${i}`,k.ic,'%','0.001')+field(T('Netzwerkgebühr'),`scheme:${i}`,k.scheme,'%','0.001')}</div>`).join('');
  $('mix').oninput=e=>{const [key,i]=(e.target.dataset.key||'').split(':');if(key){kinds[+i][key]=e.target.value;if(key==='share'){$('mix-confirm').checked=false;mixConfirmed=false;}calculate();}};
  $('tx-mix').innerHTML=kinds.map((k,i)=>`<label>${esc(T(k.id))}<span class="control"><input data-tx="${i}" type="number" min="0" step="1" inputmode="numeric" value="${esc(k.tx)}" placeholder="0"><b>Tx</b></span></label>`).join('');
  $('tx-mix').oninput=e=>{if(e.target.dataset.tx!=null){kinds[+e.target.dataset.tx].tx=e.target.value;$('mix-confirm').checked=false;mixConfirmed=false;calculate();}};
}
function splitFields(o){return `<div class="split-prices"><p class="subtle">${T('splitIntro')}</p><div class="fields split-grid">${kinds.filter(k=>k.id!=='other').map(k=>field(T(k.id),`rate:${k.id}`,o.rates[k.id],'%','0.001')).join('')}</div><details class="secondary-fees"><summary>${T('moreCards')}</summary><div class="fields">${field(T('moreCardsRate'),'rate:other',o.rates.other,'%','0.001')}${kinds.map(k=>field(T('fixedLabel',{name:T(k.id)}),`fixed:${k.id}`,o.fixed[k.id],'CHF')).join('')}</div><p class="subtle">${T('fixedHint')}</p></details></div>`;}
function icFields(o){return `<div class="fields card-primary">${field(T('markupLabel'),'rate',o.rate,'%','0.001')}${field(T('twintRate'),'rate:twint',o.rates.twint,'%','0.001')}</div><p class="model-explain">${T('icHelp')}</p><details class="secondary-fees"><summary>${T('fixedSummary')}</summary><div class="fields">${kinds.map(k=>field(T('fixedLabel',{name:T(k.id)}),`fixed:${k.id}`,o.fixed[k.id],'CHF')).join('')}</div></details>`;}
function card(o,i){const rival=o===competitor;return `<article class="offer ${rival?'competitor':''}" data-index="${i}"><div class="offer-heading"><span class="provider-tag">${rival?T('competitor'):'NEXI'}</span><span>${T('option',{n:i+1})}</span></div><label>${T('nameLabel')}<input class="plain" data-key="name" maxlength="60" value="${esc(name(o))}"></label><div class="model-toggle" role="group" aria-label="${esc(name(o))}"><button type="button" data-model="split" aria-pressed="${o.model==='split'}">Split Blend</button><button type="button" data-model="icpp" aria-pressed="${o.model==='icpp'}">IC++</button></div>${o.model==='split'?splitFields(o):icFields(o)}<div class="rent-field">${field(T('rentLabel'),'rent',o.rent,'CHF')}</div><details class="cost-details"><summary>${T('moreCosts')} <span>${T('optional')}</span></summary><div class="fields">${field(T('terminals'),'terminals',o.terminals,T('pieces'),'1')}${field(T('months'),'monthly',o.monthly,'CHF')}${field(T('annual'),'annual',o.annual,'CHF')}${field(T('setupLabel'),'setup',o.setup,'CHF')}${field(T('surcharge'),'surcharge',o.surcharge,'%','0.001')}${field(T('minLabel'),'minimum',o.minimum,'CHF')}</div></details><div class="offer-total" id="total-${i}"></div></article>`;}
function renderOffers(){
  $('offers').classList.toggle('three-offers',mode==='internal3');
  $('offers').innerHTML=offers().map(card).join('');
  $('offers').querySelectorAll('.offer').forEach((node,i)=>{const o=offers()[i];node.addEventListener('input',e=>{const key=e.target.dataset.key;if(!key)return;if(key.includes(':')){const [type,k]=key.split(':');o[type==='rate'?'rates':'fixed'][k]=e.target.value;}else{if(key==='name')o.nameEdited=true;o[key]=e.target.value;}calculate();});node.querySelectorAll('[data-model]').forEach(b=>b.onclick=()=>{o.model=b.dataset.model;renderOffers();calculate();});});
}
function context(){const c={volume:num($('volume').value),tx:num($('tx').value),years:num($('years').value)};c.share=kinds.reduce((a,k)=>a+(num(k.share)||0),0);c.mixValid=Math.abs(c.share-100)<.001&&kinds.every(k=>num(k.share)!==null&&(+k.share===0||k.id==='twint'||num(k.ic)!==null&&num(k.scheme)!==null));return c;}
function cost(o,c,v=c.volume){const tx=v*c.tx/c.volume,blocks=Object.fromEntries(kinds.map(k=>[k.id,{share:(+k.share)/100,volume:v*(+k.share)/100,tx:txMixEnabled?(+k.tx)*v/c.volume:tx*(+k.share)/100}]));let acquiring=0,interchange=0,scheme=0,twint=0;for(const k of kinds){const b=blocks[k.id];if(k.id==='twint'){twint=b.volume*(+o.rates.twint)/100+b.tx*(+o.fixed.twint);continue;}const base=o.model==='split'?+o.rates[k.id]:+o.rate;acquiring+=b.volume*base/100+b.tx*(+o.fixed[k.id]);if(o.model==='icpp'){interchange+=b.volume*(+k.ic)/100;scheme+=b.volume*(+k.scheme)/100;}}const min=Math.max(0,+o.minimum*12-acquiring-interchange-scheme),extra=v*(+o.surcharge)/100,terminal=12*(+o.rent)*(+o.terminals),other=12*(+o.monthly)+(+o.annual),setup=(+o.setup)/c.years;return {acquiring,interchange,scheme,twint,min,extra,terminal,other,setup,total:acquiring+interchange+scheme+twint+min+extra+terminal+other+setup};}
function validOffer(o){const shared=['rent','terminals','monthly','annual','setup','minimum','surcharge'];if(!o.name.trim()||shared.some(k=>num(o[k])===null)||!Number.isInteger(+o.terminals))return false;return kinds.every(k=>{const share=+k.share;if(share<=0&&(!txMixEnabled||+k.tx<=0))return true;const rate=o.model==='split'||k.id==='twint'?o.rates[k.id]:o.rate;return num(rate)!==null&&num(o.fixed[k.id])!==null;});}
function calculate(){
  const c=context(),current=offers(),usesIc=current.some(o=>o.model==='icpp');
  $('mix-status').textContent=T('activeShare',{share:fmt(c.share,1)});
  $('mix-tag').textContent=T(mixConfirmed?'mixChecked':'mixPending');
  $('mix-preview').innerHTML=kinds.map(k=>`<span>${esc(T(k.id))} <b>${fmt(+k.share,1)} %</b></span>`).join('');
  $('mix-warning').textContent=T(mixConfirmed?'warningConfirmed':'warningPending');
  $('mix-error').textContent=c.mixValid?'':T('invalidMix');
  c.txMixValid=!txMixEnabled||kinds.every(k=>num(k.tx)!==null&&Number.isInteger(num(k.tx)))&&kinds.reduce((a,k)=>a+(+k.tx),0)===c.tx;
  $('tx-mix-error').textContent=c.txMixValid?'':T('invalidTx',{tx:fmt(c.tx||0)});
  $('ticket').textContent=c.volume>0&&c.tx>0?T('ticket',{value:chf(c.volume/c.tx)}):'';
  const ready=c.volume>0&&c.tx>0&&Number.isInteger(c.tx)&&Number.isInteger(c.years)&&c.years>=1&&c.years<=10&&c.mixValid&&c.txMixValid&&current.every(validOffer);
  $('message').hidden=ready;$('result').hidden=!ready;$('print').disabled=!ready;
  if(!ready){$('message').textContent=!c.mixValid||!c.txMixValid?T('inputMix'):T('inputRates');current.forEach((o,i)=>{$(`total-${i}`).textContent=T('pendingCost');});return;}
  const ranked=current.map((o,i)=>({o,i,r:cost(o,c)})).sort((a,b)=>a.r.total-b.r.total);
  current.forEach((o,i)=>{$(`total-${i}`).innerHTML=`<span>${T('annualCost')}</span><strong>${chf(cost(o,c).total)}</strong>`;});
  $('winner').textContent=name(ranked[0].o);
  $('saving').textContent=T('saving',{cost:chf(ranked[0].r.total),saving:chf(ranked[1].r.total-ranked[0].r.total)});
  const max=Math.max(1,...ranked.map(x=>x.r.total));
  $('ranking').innerHTML=ranked.map((x,i)=>`<div class="rank"><div class="rank-line"><div><b>${esc(name(x.o))}</b><small>${x.o===competitor?T('competitor'):'Nexi'} · ${x.o.model==='icpp'?'IC++':'Split Blend'}</small></div><strong>${T('rankCost',{cost:chf(x.r.total)})}</strong></div><div class="bar-bg"><div class="bar ${i?'secondary':''}" style="width:${Math.max(2,x.r.total/max*100)}%"></div></div></div>`).join('');
  const rows=[['acquiring','acquiring'],['Interchange','interchange'],['scheme','scheme'],['minimum','min'],['extra','extra'],['terminal','terminal'],['otherCost','other'],['setup','setup'],['total','total']];
  rows.splice(3,0,['twint','twint']);
  $('breakdown').innerHTML=`<div class="table-wrap"><table><thead><tr><th>${T('costHeader')}</th>${ranked.map(x=>`<th>${esc(name(x.o))}</th>`).join('')}</tr></thead><tbody>${rows.map(([label,k])=>`<tr><td>${T(label)}</td>${ranked.map(x=>`<td>${chf(x.r[k])}</td>`).join('')}</tr>`).join('')}</tbody></table></div><h4>${T('appliedRates')}</h4><div class="table-wrap"><table><thead><tr><th>${T('shareRate')}</th>${ranked.map(x=>`<th>${esc(name(x.o))}</th>`).join('')}</tr></thead><tbody>${kinds.map(k=>`<tr><td>${T('shareRow',{name:esc(T(k.id)),share:fmt(+k.share,1)})}</td>${ranked.map(x=>`<td>${x.o.model==='icpp'&&k.id!=='twint'?T('markup',{rate:fmt(+x.o.rate,3)}):`${fmt(+x.o.rates[k.id]||0,3)} %`}${+x.o.fixed[k.id]?T('rateFixed',{amount:chf(+x.o.fixed[k.id])}):''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
  const sampled=[.25,.5,.75,1,1.5,2,3,5].map(k=>Math.max(1000,Math.round(c.volume*k/1000)*1000)),switches=sampled.map(v=>({v,o:[...current].sort((a,b)=>cost(a,c,v).total-cost(b,c,v).total)[0]})).filter((x,i,a)=>!i||x.o!==a[i-1].o);
  $('thresholds').innerHTML=`<p class="subtle">${T('scenarioIntro')}</p><div class="threshold-list">${switches.map(x=>`<div class="threshold"><span>${T('scenarioAt',{volume:chf(x.v)})}</span><strong>${esc(name(x.o))}</strong></div>`).join('')}</div><p class="footnote">${T('scenarioNote')}</p>`;
  const mix=kinds.map(k=>`${T(k.id)} ${k.share} %${txMixEnabled?` / ${k.tx} Tx`:''}`).join('; ');
  $('print-basis').textContent=T('printBasis',{volume:chf(c.volume),tx:fmt(c.tx),years:c.years,mix,status:T(mixConfirmed?'statusYes':'statusNo')});
  $('limits').textContent=T('breakdownDate',{date:new Intl.DateTimeFormat(I.locale).format(new Date()),demo:demo?T('exampleCaveat'):'',tx:T(txMixEnabled?'transactionActual':'transactionAssumed'),mix:T(mixConfirmed?'confirmed':'unconfirmed'),ic:usesIc?T('icNote'):'',limits:T('limitations')});
}
function switchMode(next){mode=next;document.querySelectorAll('[data-mode]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mode===mode)));$('mode-help').textContent=T(mode==='internal2'?'modeHelp2':mode==='internal3'?'modeHelp3':'modeHelpCompetitor');renderOffers();calculate();}
function refreshLanguage(code){I.setLang(code);I.staticText();$('language-code').textContent=I.lang.toUpperCase();$('language-heading').textContent=T('languageHeading');$('language-trigger').setAttribute('aria-label',T('languageTrigger'));document.querySelector('.language-close').setAttribute('aria-label',T('languageClose'));document.querySelectorAll('[data-language]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.language===I.lang)));$('demo').textContent=T(demo?'demoLoaded':'demoButton');$('mode-help').textContent=T(mode==='internal2'?'modeHelp2':mode==='internal3'?'modeHelp3':'modeHelpCompetitor');renderMix();renderOffers();calculate();}
const languageTrigger=$('language-trigger'),languageMenu=$('language-menu'),languageClose=document.querySelector('.language-close');
function closeLanguage(restoreFocus=false){languageMenu.hidden=true;languageTrigger.setAttribute('aria-expanded','false');document.body.classList.remove('language-open');languageMenu.setAttribute('aria-modal','false');if(restoreFocus)languageTrigger.focus();}
function openLanguage(){languageMenu.hidden=false;languageTrigger.setAttribute('aria-expanded','true');document.body.classList.add('language-open');languageMenu.setAttribute('aria-modal',String(matchMedia('(max-width: 600px)').matches));languageMenu.querySelector('[aria-pressed="true"]').focus();}
languageTrigger.onclick=()=>languageMenu.hidden?openLanguage():closeLanguage(true);
languageClose.onclick=()=>closeLanguage(true);
languageMenu.querySelectorAll('[data-language]').forEach(button=>button.onclick=()=>{refreshLanguage(button.dataset.language);closeLanguage(true);});
document.addEventListener('pointerdown',e=>{if(!languageMenu.hidden&&!e.target.closest('.language-control'))closeLanguage();});
document.addEventListener('keydown',e=>{if(languageMenu.hidden)return;if(e.key==='Escape'){e.preventDefault();closeLanguage(true);}if(e.key==='Tab'&&matchMedia('(max-width: 600px)').matches){const focusable=[languageClose,...languageMenu.querySelectorAll('[data-language]')];const first=focusable[0],last=focusable[focusable.length-1];if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}}});
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>switchMode(b.dataset.mode));
$('demo').onclick=()=>{for(const [o,base,rent] of [[nexi[0],1.2,25],[nexi[1],1.45,0],[competitor,1.35,28]]){o.rates.mcDebit=String(base);o.rates.visaDebit=String(base);o.rates.credit=String(base+0.2);o.rates.twint='1.25';o.rent=String(rent);}nexi[2].rate='0.45';nexi[2].rates.twint='1.25';nexi[2].rent='25';demo=true;renderOffers();calculate();$('demo').textContent=T('demoLoaded');};
$('print').onclick=()=>{document.querySelectorAll('.result-details').forEach(d=>d.open=true);window.print();};
['volume','tx'].forEach(id=>$(id).addEventListener('input',e=>{const input=e.target,before=input.value.slice(0,input.selectionStart).replace(/\D/g,'').length,digits=input.value.replace(/\D/g,'');input.value=digits.replace(/\B(?=(\d{3})+(?!\d))/g,'’');let pos=0,seen=0;while(pos<input.value.length&&seen<before){if(/\d/.test(input.value[pos]))seen++;pos++;}input.setSelectionRange(pos,pos);calculate();}));
$('years').oninput=calculate;
$('mix-confirm').onchange=e=>{mixConfirmed=e.target.checked;calculate();};
$('tx-mix-toggle').onchange=e=>{txMixEnabled=e.target.checked;$('tx-mix').hidden=!txMixEnabled;calculate();};
I.setLang('de');I.staticText();renderMix();switchMode('internal2');refreshLanguage('de');
})();
