/* Explicit, contract-confirmed card surcharges. No inferred regional distribution. */
window.PCCMarkups=(()=>{'use strict';
 const keys=['intra','inter','commercial','debitToken'];
 const source='https://www.nexi.swiss/content/dam/nexich/documents/download-center/pricelist/CH_DE_KMU_Preisliste_May2026.pdf';
 const tariff=Object.freeze({intra:1.03,inter:1.55,commercial:1.45,debitToken:0.16});
 const shares=Object.fromEntries(keys.map(k=>[k,'']));
 const D={
  title:['Zusätzliche Kartenmerkmale','Caractéristiques supplémentaires des cartes','Additional card characteristics','Caratteristiche aggiuntive delle carte'],
  basis:['Anteil am gesamten Zahlungsumsatz (inkl. TWINT). Nur tatsächlich betroffene Visa-/Mastercard-Umsätze eintragen; TWINT, V PAY und weitere Karten ausschliessen.','Part du chiffre d’affaires total (TWINT inclus). Saisir uniquement les paiements Visa/Mastercard concernés ; exclure TWINT, V PAY et les autres cartes.','Share of total payment turnover (including TWINT). Enter only eligible Visa/Mastercard turnover; exclude TWINT, V PAY and other cards.','Quota del volume totale (TWINT incluso). Inserire solo i pagamenti Visa/Mastercard interessati; escludere TWINT, V PAY e altre carte.'],
  intra:['Visa/Mastercard · intraregional (Standard)','Visa/Mastercard · intrarégional','Visa/Mastercard · intraregional','Visa/Mastercard · intraregionale'],
  inter:['Visa/Mastercard · interregional','Visa/Mastercard · interrégional','Visa/Mastercard · interregional','Visa/Mastercard · interregionale'],
  commercial:['Ausländische Commercial Cards','Cartes commerciales étrangères','Foreign commercial cards','Carte commerciali estere'],
  debitToken:['Domestische Debit-Token-Zahlungen','Paiements débit tokenisés domestiques','Domestic debit token payments','Pagamenti debit tokenizzati domestici'],
  overlap:['Commercial Cards sind ein Teil der regionalen Anteile und werden zusätzlich berechnet. Regionen gemäss Nexi-Definition.','Les cartes commerciales font partie des parts régionales et sont facturées en supplément. Régions selon la définition Nexi.','Commercial cards are a subset of regional shares and incur an additional fee. Regions follow Nexi definitions.','Le carte commerciali sono parte delle quote regionali e comportano un supplemento. Regioni secondo la definizione Nexi.'],
  treatment:['Anwendung pro Angebot','Application par offre','Treatment per offer','Applicazione per offerta'],
  choose:['Bitte auswählen','Veuillez sélectionner','Please select','Seleziona'],
  included:['Bereits im Preis enthalten / kein Zuschlag','Déjà inclus / aucun supplément','Already included / no surcharge','Già incluso / nessun supplemento'],
  nexi:['Zusätzlich gemäss Nexi-Preisliste Mai 2026','En supplément selon le tarif Nexi de mai 2026','Additional under Nexi price list, May 2026','In aggiunta secondo il listino Nexi di maggio 2026'],
  custom:['Zusätzlich gemäss bestätigter Offerte','En supplément selon l’offre confirmée','Additional under confirmed quote','In aggiunta secondo offerta confermata'],
  confirm:['Nur zusätzliche, vertraglich bestätigte Zuschläge wählen. Bereits enthaltene Gebühren nicht erneut erfassen. Nexi-Standardtarif: Visa aus Israel/Türkei und andere Sonderfälle separat gemäss Offerte berücksichtigen.','Choisir uniquement les suppléments contractuels confirmés, sans double comptage. Tarif standard Nexi : traiter séparément les Visa d’Israël/Turquie et autres exceptions selon l’offre.','Select only confirmed additional fees, without double counting. Nexi standard tariff: handle Visa cards from Israel/Turkey and other exceptions separately under the quote.','Selezionare solo supplementi contrattuali confermati, senza duplicazioni. Tariffa standard Nexi: trattare separatamente Visa di Israele/Turchia e altre eccezioni secondo offerta.'],
  invalid:['Kartenmerkmale prüfen: Anteile 0–100 %, regionale Anteile höchstens Visa-/Mastercard-Anteil; Commercial Cards höchstens regionale Anteile; domestische Debit-Token höchstens verbleibender Karten- und Debit-Anteil.','Vérifier : parts de 0 à 100 %, régions au maximum la part Visa/Mastercard ; cartes commerciales au maximum les régions ; débit tokenisé domestique dans les parts débit et domestique restantes.','Check shares: 0–100%; regional shares must fit the Visa/Mastercard mix, commercial cards must fit regional shares, and domestic debit tokens must fit the remaining domestic and debit shares.','Verificare: quote 0–100%; regioni entro la quota Visa/Mastercard, carte commerciali entro le quote regionali, token debit domestici entro le quote debit e domestica residue.'],
  policyError:['Bitte für beide Angebote die Anwendung der Zuschläge bestätigen und bei individueller Offerte alle benötigten Zuschlagssätze eintragen. Die Nexi-Preisliste wird nicht automatisch auf IC++ übertragen.','Confirmer les suppléments pour les deux offres et saisir les taux nécessaires. Le tarif Nexi n’est pas appliqué automatiquement à IC++.','Confirm surcharge treatment for both offers and enter all required quoted rates. The Nexi price list is not automatically applied to IC++.','Confermare i supplementi per entrambe le offerte e inserire i tassi necessari. Il listino Nexi non si applica automaticamente a IC++.'],
  cost:['Zusätzliche Karten-Markups','Suppléments cartes','Additional card markups','Supplementi carte'],
  rate:['Zuschlag','Supplément','Surcharge','Supplemento'],
  notEntered:['Nicht erfasst','Non renseigné','Not entered','Non inserito'],
  noMarkup:['Kein zusätzlicher Zuschlag','Aucun supplément','No additional surcharge','Nessun supplemento']
 };
 const t=key=>D[key]?.[['de','fr','en','it'].indexOf(window.PaymentI18n.lang)]||key;
 const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 function number(v){if(v==null||String(v).trim()==='')return null;const text=String(v).trim().replace(',','.');if(!/^\d+(?:\.\d+)?$/.test(text))return null;const n=Number(text);return Number.isFinite(n)&&n>=0&&n<=100?n:null;}
 const make=()=>({mode:'',rates:Object.fromEntries(keys.map(k=>[k,'']))});
 const active=()=>keys.some(k=>number(shares[k])>0);
 function validate(kinds,offers){
  const values=Object.fromEntries(keys.map(k=>[k,number(shares[k])||0]));
  const share=id=>Number(kinds.find(k=>k.id===id)?.share)||0;
  const eligible=share('mcDebit')+share('visaDebit')+share('credit'),debit=share('mcDebit')+share('visaDebit'),foreign=values.intra+values.inter;
  if(keys.some(k=>shares[k]!==''&&number(shares[k])===null)||foreign>eligible+1e-8||values.commercial>foreign+1e-8||values.debitToken>Math.min(debit,eligible-foreign)+1e-8)return {valid:false,error:t('invalid')};
  if(active()&&offers.some(o=>{const p=o.cardMarkup;if(!p||!['included','nexi','custom'].includes(p.mode))return true;if(p.mode==='nexi')return o.provider!=='Nexi'||o.model!=='split';return p.mode==='custom'&&keys.some(k=>values[k]>0&&number(p.rates[k])===null);}))return {valid:false,error:t('policyError')};
  return {valid:true,error:''};
 }
 function rates(o){const p=o.cardMarkup;if(p?.mode==='nexi'&&o.provider==='Nexi'&&o.model==='split')return tariff;if(p?.mode==='custom')return Object.fromEntries(keys.map(k=>[k,number(p.rates[k])||0]));return Object.fromEntries(keys.map(k=>[k,0]));}
 function cost(o,volume){const r=rates(o);const details=keys.map(key=>({key,share:number(shares[key]),rate:r[key],volume:volume*(number(shares[key])||0)/100,amount:volume*(number(shares[key])||0)/100*r[key]/100}));return {cardMarkups:details.reduce((a,d)=>a+d.amount,0),cardMarkupDetails:details};}
 function snapshot(offers){return {version:'1.0.0',percentBasis:'totalAnnualPaymentTurnoverIncludingTwint',shares:Object.fromEntries(keys.map(k=>[k,number(shares[k])])),offers:offers.map(o=>({provider:o.provider,mode:o.cardMarkup.mode||null,tariff:o.cardMarkup.mode==='nexi'?'Nexi-CH-2026-05-01':null,source:o.cardMarkup.mode==='nexi'?source:null,rates:rates(o)}))};}
 function input(key,value,share=false,readonly=false){return `<label>${esc(t(key))}${share?'':` · ${esc(t('rate'))}`}<span class="control"><input ${share?`data-card-share="${key}"`:`data-card-rate="${key}"`} type="text" inputmode="decimal" value="${esc(value)}" placeholder="${esc(window.PaymentI18n.t('example',{value:share?({intra:10,inter:5,commercial:3,debitToken:20}[key]):'0.10'}))}" ${readonly?'readonly':''}><b>%</b></span></label>`;}
 function render(offers,refresh){
  const root=document.getElementById('card-features');
  root.querySelector('summary').textContent=t('title');
  root.querySelector('.card-features-body').innerHTML=`<p class="subtle">${esc(t('basis'))}</p><div class="fields">${keys.map(k=>input(k,shares[k],true)).join('')}</div><p class="subtle">${esc(t('overlap'))}</p><div class="card-markup-policies" ${active()?'':'hidden'}><h4>${esc(t('treatment'))}</h4><div class="fields">${offers.map((o,i)=>`<label><span data-card-provider-label="${i}">${esc(i===0?'Nexi':window.PaymentI18n.t('defaultName4'))}</span><select data-card-policy="${i}">${[['',t('choose')],['included',t('included')],...(o.provider==='Nexi'&&o.model==='split'?[['nexi',t('nexi')]]:[]),['custom',t('custom')]].map(([value,text])=>`<option value="${value}" ${o.cardMarkup.mode===value?'selected':''}>${esc(text)}</option>`).join('')}</select></label>`).join('')}</div><p class="subtle">${esc(t('confirm'))}</p>${offers.map((o,i)=>o.cardMarkup.mode==='custom'||o.cardMarkup.mode==='nexi'?`<div class="card-quoted-rates" data-card-offer="${i}"><strong>${esc(i===0?'Nexi':window.PaymentI18n.t('competitor'))}${o.cardMarkup.mode==='nexi'?' · Mai 2026':''}</strong><div class="fields">${keys.map(k=>input(k,o.cardMarkup.mode==='nexi'?tariff[k]:o.cardMarkup.rates[k],false,o.cardMarkup.mode==='nexi')).join('')}</div></div>`:'').join('')}</div><p id="card-features-error" role="alert"></p>`;
  root.oninput=e=>{const el=e.target;if(el.dataset.cardShare){shares[el.dataset.cardShare]=el.value;root.querySelector('.card-markup-policies').hidden=!active();}if(el.dataset.cardRate){const index=+el.closest('[data-card-offer]').dataset.cardOffer;offers[index].cardMarkup.rates[el.dataset.cardRate]=el.value;}refresh();};
  root.onchange=e=>{if(e.target.dataset.cardPolicy!=null){offers[+e.target.dataset.cardPolicy].cardMarkup.mode=e.target.value;render(offers,refresh);refresh();}};
 }
 return {keys,tariff,source,t,number,make,active,validate,cost,snapshot,render,shares};
})();
