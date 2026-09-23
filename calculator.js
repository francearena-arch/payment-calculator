(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  const format = n => new Intl.NumberFormat('de-CH', {maximumFractionDigits:0}).format(n);
  const money = n => `CHF ${format(n)}`;
  const pct = n => new Intl.NumberFormat('de-CH',{maximumFractionDigits:2}).format(n) + ' %';
  const segments = [
    {name:'Debit Consumer', share:'', interchange:'', scheme:''},
    {name:'Credit Consumer', share:'', interchange:'', scheme:''},
    {name:'Business / Commercial', share:'', interchange:'', scheme:''},
    {name:'Weitere Karten', share:'', interchange:'', scheme:''}
  ];
  const offers = {
    nexi:{model:'blended',rate:'',fixed:'',annual:''},
    other:{model:'blended',rate:'',fixed:'',annual:''}
  };
  const numeric = value => value !== '' && Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : null;
  function field(label, key, value, suffix, step) {
    return `<label>${label}<span class="control"><input data-key="${key}" type="number" min="0" step="${step}" inputmode="decimal" value="${value}" placeholder="0"><b>${suffix}</b></span></label>`;
  }
  function renderOffer(id) {
    const o=offers[id], holder=$(id+'-fields');
    holder.innerHTML=`<label>Preismodell<select data-key="model"><option value="blended" ${o.model==='blended'?'selected':''}>Blended · ein Gesamtsatz</option><option value="icpp" ${o.model==='icpp'?'selected':''}>IC++ · Gebühren getrennt</option></select></label>`+
      field(o.model==='blended'?'Blended Satz':'Acquirer Fee / Marge','rate',o.rate,'%', '0.001')+
      field('Fixbetrag pro Transaktion','fixed',o.fixed,'CHF','0.01')+
      field('Weitere jährliche Fixkosten','annual',o.annual,'CHF','1')+
      `<p class="subtle">${o.model==='blended'?'Gesamtsatz inklusive Karten- und Netzwerkgebühren eingeben.':'Interchange und Scheme Fees werden aus dem Kartenmix ergänzt.'}</p>`;
    holder.querySelectorAll('[data-key]').forEach(el=>el.addEventListener(el.tagName==='SELECT'?'change':'input',()=>{
      o[el.dataset.key]=el.value;
      if(el.dataset.key==='model') renderOffer(id);
      $('mix-details').classList.toggle('hidden',!Object.values(offers).some(x=>x.model==='icpp'));
      calculate();
    }));
  }
  function renderMix(){
    $('mix-rows').innerHTML=segments.map((s,i)=>`<div class="mix-row"><strong>${s.name}</strong>${field('Umsatzanteil',`share-${i}`,s.share,'%','0.1')}${field('Interchange',`interchange-${i}`,s.interchange,'%','0.001')}${field('Scheme Fee',`scheme-${i}`,s.scheme,'%','0.001')}</div>`).join('');
    $('mix-rows').querySelectorAll('input').forEach(el=>el.addEventListener('input',()=>{
      const [key,i]=el.dataset.key.split('-');segments[Number(i)][key]=el.value;calculate();
    }));
  }
  function calculate(){
    const volume=numeric($('volume').value), tx=numeric($('transactions').value);
    $('ticket').textContent=volume!==null&&tx>0?`Durchschnittlicher Kartenbon: ${money(volume/tx)}`:'';
    const icpp=Object.values(offers).some(o=>o.model==='icpp');
    let pass=0, mixValid=true;
    if(icpp){
      const sum=segments.reduce((a,s)=>a+(numeric(s.share)??0),0);
      mixValid=segments.every(s=>numeric(s.share)!==null && (numeric(s.share)===0 || (numeric(s.interchange)!==null&&numeric(s.scheme)!==null)))&&Math.abs(sum-100)<0.01;
      $('mix-status').textContent=`${new Intl.NumberFormat('de-CH',{maximumFractionDigits:1}).format(sum)} % zugeteilt`;
      $('mix-error').textContent=mixValid?'':`Bitte die Umsatzanteile auf genau 100 % verteilen und für alle aktiven Segmente beide Gebührensätze eingeben.`;
      if(mixValid) pass=segments.reduce((a,s)=>a+Number(s.share)/100*(Number(s.interchange||0)+Number(s.scheme||0))/100,0);
    } else {$('mix-error').textContent='';$('mix-status').textContent='';}
    const ready=volume!==null&&volume>0&&tx!==null&&tx>0&&mixValid&&Object.values(offers).every(o=>numeric(o.rate)!==null&&numeric(o.fixed)!==null&&numeric(o.annual)!==null);
    $('message').hidden=ready;
    $('result-body').hidden=!ready;
    $('print').disabled=!ready;
    if(!ready){$('message').textContent=icpp&&!mixValid?'Vervollständige den Kartenmix für die IC++-Berechnung.':'Gib Umsatz, Transaktionen und die Konditionen beider Angebote ein. Trage bei nicht erhobenen Fixgebühren 0 ein.';return;}
    const calc=o=>{
      const variable=volume*Number(o.rate)/100;
      const network=o.model==='icpp'?volume*pass:0;
      const txFees=tx*Number(o.fixed);
      const annual=Number(o.annual);
      return {variable,network,txFees,annual,total:variable+network+txFees+annual};
    };
    const a=calc(offers.nexi),b=calc(offers.other),diff=b.total-a.total;
    $('result-label').textContent=Math.abs(diff)<0.005?'Beide Angebote kosten gleich':diff>0?'Nexi ist günstiger pro Jahr':'Vergleichsangebot ist günstiger pro Jahr';
    $('difference').textContent=money(Math.abs(diff));
    $('result-detail').textContent=`${Math.abs(diff)<0.005?'Keine Kostendifferenz':`${pct(Math.abs(diff)/(diff>0?b.total:a.total)*100 || 0)} gegenüber dem teureren Angebot`} · ${format(tx)} Transaktionen`;
    $('monthly').textContent=money(Math.abs(diff)/12);
    $('effective-a').textContent=pct(a.total/volume*100);
    $('effective-b').textContent=pct(b.total/volume*100);
    const max=Math.max(a.total,b.total,1);
    $('bars').innerHTML=[['Nexi',a,'a'],['Vergleich',b,'b']].map(([name,r,cls])=>`<div class="bar-label"><strong>${name}</strong><strong>${money(r.total)}</strong></div><div class="bar-bg"><div class="bar ${cls}" style="width:${Math.max(0,r.total/max*100)}%"></div></div>`).join('');
    $('breakdown').innerHTML=`<div class="breakdown-grid"><strong>Kostenbestandteil</strong><strong>Nexi</strong><strong>Vergleich</strong>${[['Variabler Angebotssatz','variable'],['Interchange + Scheme Fees','network'],['Transaktionsgebühren','txFees'],['Jährliche Fixkosten','annual'],['Gesamtkosten','total']].map(([name,key])=>`<span>${name}</span><span>${money(a[key])}</span><span>${money(b[key])}</span>`).join('')}</div>`;
  }
  ['volume','transactions'].forEach(id=>$(id).addEventListener('input',calculate));
  $('demo').addEventListener('click',()=>{
    $('volume').value=500000;$('transactions').value=10000;
    Object.assign(offers.nexi,{model:'blended',rate:'1.25',fixed:'0.05',annual:'180'});
    Object.assign(offers.other,{model:'blended',rate:'1.45',fixed:'0.08',annual:'240'});
    segments.forEach((s,i)=>Object.assign(s,[{share:'55',interchange:'0.2',scheme:'0.12'},{share:'30',interchange:'0.3',scheme:'0.15'},{share:'10',interchange:'1.5',scheme:'0.2'},{share:'5',interchange:'2',scheme:'0.25'}][i]));
    renderOffer('nexi');renderOffer('other');renderMix();$('mix-details').classList.add('hidden');calculate();
    $('demo').textContent='Beispielwerte geladen';
  });
  $('print').addEventListener('click',()=>window.print());
  renderOffer('nexi');renderOffer('other');renderMix();$('mix-details').classList.add('hidden');calculate();
})();
