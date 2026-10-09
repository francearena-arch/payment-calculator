// Run from project root after npm run build; local static server on port 18765.
import {chromium} from '@playwright/test';import assert from 'node:assert/strict';import {mkdir} from 'node:fs/promises';
import http from 'node:http';import {readFile} from 'node:fs/promises';
const server=http.createServer(async(req,res)=>{try{const path=req.url.split('?')[0];const f=path==='/'?'index.html':path.slice(1);const data=await readFile('dist/'+f);res.setHeader('Content-Type',f.endsWith('.js')?'text/javascript':f.endsWith('.css')?'text/css':f.endsWith('.svg')?'image/svg+xml':f.endsWith('.png')?'image/png':'text/html');res.end(data);}catch{res.statusCode=404;res.end();}});await new Promise(resolve=>server.listen(18765,'127.0.0.1',resolve));
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});await mkdir('qa',{recursive:true});
const base='http://127.0.0.1:18765';
const o={name:'Standard',provider:'Nexi',model:'split',rates:{mcDebit:1.2,visaDebit:1.2,credit:1.4,twint:1.25,other:0},fixed:{mcDebit:0,visaDebit:0,credit:0,twint:0,other:0},rate:0,rent:25,terminals:1,monthly:0,annual:0,setup:0,minimum:0,surcharge:0};
const row={id:'test-id',channel:'Remote Sales',purpose:'retention',quote_date:'2026-10-01',turnover_band:'500k–1m',competitor:'Worldline',status:'approved',outcome:'retained',offered_option:0,payload:{offers:[o,{...o,provider:'competitor',name:'Worldline'}],mix:{mcDebit:30,visaDebit:30,credit:25,twint:15,other:0},assumptions:{}}};
for(const admin of [false,true]){
 const context=await browser.newContext({viewport:{width:admin?1440:390,height:900}});
 const user={id:'test-user',email:'test@example.test',email_confirmed_at:'2026-01-01',aud:'authenticated',role:'authenticated',app_metadata:{},user_metadata:{}};
 const token=['e30',Buffer.from(JSON.stringify({exp:Math.floor(Date.now()/1000)+3600,sub:user.id,role:'authenticated',aal:admin?'aal2':'aal1'})).toString('base64url'),'test'].join('.');
 await context.addInitScript(({token,user})=>localStorage.setItem('sb-iqutwfournsyzlmdkwcf-auth-token',JSON.stringify({access_token:token,refresh_token:'test',expires_at:Math.floor(Date.now()/1000)+3600,expires_in:3600,token_type:'bearer',user})),{token,user});
 let submitted=0,writes=0;
 await context.route('**/api/service',async route=>{const b=route.request().postDataJSON();let d={ok:true};if(['submit','review','outcome','invite','suspend','restore','deleteUser'].includes(b.action))writes++;if(b.action==='me')d={profile:{email:user.email,is_admin:admin}};if(b.action==='report')d={cases:[row,{...row,id:'pending-id',status:'pending'}]};if(b.action==='cases')d={cases:[row]};if(b.action==='users')d={users:[]};if(b.action==='submit'){submitted++;d={id:'saved'};}await route.fulfill({json:d});});
 const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.goto(base);await page.locator('#app-nav').waitFor({state:'visible'});
 assert.equal(await page.locator('[data-view="reporting"]').count(),admin?1:0);
 assert.equal(await page.locator('#submission').isVisible(),false);await page.locator('[data-mode=competitor]').click();
 await page.locator('#submit-quote').click();
 assert.equal(await page.locator('#channel').getAttribute('aria-invalid'),'true');
 assert.equal(await page.locator('#quote-date').getAttribute('aria-invalid'),'true');
 assert.equal(await page.locator('#mix-confirm').getAttribute('aria-invalid'),'true');
 assert.ok(await page.locator('.field-error').count()>0);
 await page.locator('#channel').selectOption('Remote Sales');
 assert.equal(await page.locator('#channel').getAttribute('aria-invalid'),null);
 await page.locator('#channel').selectOption('Remote Sales');await page.locator('[data-mode="competitor"]').click();await page.locator('#competitor').selectOption('Worldline');await page.locator('#option-count').selectOption('3');assert.equal(await page.locator('.offer').count(),4);
 for(const language of ['fr','en','it','de']){await page.locator('#language-trigger').click();await page.locator(`[data-language="${language}"]`).click();assert.equal(await page.locator('#channel').inputValue(),'Remote Sales');}
 await page.locator('#demo').click();await page.locator('#submit-quote').click();assert.equal(submitted,0);assert.match(await page.locator('#submission-status').innerText(),/Beispieldaten/);
 // Fill actual blank comparison after reload.
 await page.reload();await page.locator('#app-nav').waitFor({state:'visible'});await page.locator('#channel').selectOption('Remote Sales');await page.locator('[data-mode="competitor"]').click();await page.locator('#competitor').selectOption('Worldline');await page.locator('#quote-date').fill('2026-10-01');await page.locator('#industry').selectOption('Gastro');await page.locator('#real-quote').check();
 await page.locator('#language-trigger').click();await page.locator('[data-language=fr]').click();assert.equal(await page.locator('#real-quote').isChecked(),true);await page.locator('#language-trigger').click();await page.locator('[data-language=de]').click();
 for(const article of await page.locator('.offer').all())for(const [key,value] of [['mcDebit','1.2'],['visaDebit','1.2'],['credit','1.4'],['twint','1.25']])await article.locator(`[data-key="rate:${key}"]`).fill(value);
 await page.locator('.extra-settings').evaluate(el=>el.open=true);await page.locator('#mix-confirm').check();assert.equal(await page.evaluate(()=>window.PCCCalculator.snapshot().ready),true);await page.locator('#submit-quote').click();await page.waitForFunction(()=>document.getElementById('submission-status').textContent.includes('eingereicht'));assert.equal(submitted,1);
 await page.locator('.extra-settings').evaluate(el=>el.open=false);await page.evaluate(()=>scrollTo(0,0));await page.screenshot({path:`qa/${admin?'desktop':'mobile'}-calculator.png`,fullPage:true});await page.screenshot({path:`qa/${admin?'desktop':'mobile'}-top.png`});
 assert.equal(await page.locator('#app-nav [aria-current=page]').getAttribute('data-view'),'calculator');
 assert.match(await page.locator('#winner').innerText(),/Gleiche Gesamtkosten/);
 for(const width of [320,375,768,1024,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);}await page.setViewportSize({width:admin?1440:390,height:900});
 assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 if(admin){await page.evaluate(()=>document.querySelectorAll('.result-details').forEach(d=>d.open=true));await page.pdf({path:'qa/comparison.pdf',format:'A4',printBackground:true});}
 if(admin){await page.locator('[data-view="reporting"]').click();await page.locator('#report-content').waitFor();await page.locator('#language-trigger').click();await page.locator('[data-language=en]').click();await page.locator('#report-content').waitFor();assert.equal(await page.locator('#reporting-view').isVisible(),true);await page.locator('#language-trigger').click();await page.locator('[data-language=de]').click();await page.locator('#report-content').waitFor();await page.screenshot({path:'qa/report.png',fullPage:true});await page.evaluate(()=>document.body.classList.add('printing-report'));await page.pdf({path:'qa/report.pdf',format:'A4',printBackground:true,margin:{top:'15mm',bottom:'15mm',left:'12mm',right:'12mm'}});
 await page.evaluate(()=>document.body.classList.remove('printing-report'));
 const writesBeforeDemo=writes;await page.locator('#report-demo').click();await page.locator('#demo-notice').waitFor({state:'visible'});assert.equal(await page.locator('[data-review]').count(),0);
 await page.locator('#report-purpose').selectOption('retention');assert.match(await page.locator('.purpose-card h3').innerText(),/Retention/);
 await page.locator('#report-purpose').selectOption('');await page.locator('[data-report-tab=vertical]').click();assert.ok((await page.locator('.vertical-report tbody tr').count())>=5);await page.locator('[data-report-tab=summary]').click();await page.screenshot({path:'qa/demo-summary.png',fullPage:true});
 await page.locator('[data-report-tab=detail]').click();await page.locator('#report-reference').selectOption('0');assert.ok(await page.locator('.reference-value').innerText());await page.locator('#report-trend-method').selectOption('twint');assert.equal(await page.locator('#report-trend-method').inputValue(),'twint');await page.locator('#report-trend-method').selectOption('mcDebit');await page.screenshot({path:'qa/demo-details.png',fullPage:true});
 await page.locator('[data-report-tab=library]').click();await page.screenshot({path:'qa/demo-library.png',fullPage:true});
 for(const tab of ['summary','vertical','detail','library']){await page.locator(`[data-report-tab=${tab}]`).click();for(const width of [320,375,390,768,1440]){await page.setViewportSize({width,height:900});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true,`Report overflow: ${tab} ${width}`);}}await page.setViewportSize({width:390,height:900});await page.locator('[data-report-tab=summary]').click();await page.screenshot({path:'qa/demo-mobile.png',fullPage:true});
 await page.setViewportSize({width:1440,height:900});await page.evaluate(()=>document.body.classList.add('printing-report'));await page.pdf({path:'qa/demo-report.pdf',format:'A4',printBackground:true,margin:{top:'15mm',bottom:'15mm',left:'12mm',right:'12mm'}});await page.evaluate(()=>document.body.classList.remove('printing-report'));
 for(const language of ['fr','en','it','de']){
 await page.locator('#language-trigger').click();await page.locator(`[data-language=${language}]`).click();await page.locator('#report-trend-method').waitFor({state:'attached'});
 assert.equal(await page.locator('#demo-notice').isVisible(),true);assert.equal(await page.locator('#report-reference').inputValue(),'0');
 await page.evaluate(()=>document.body.classList.add('printing-report'));await page.pdf({path:`qa/management-${language}.pdf`,format:'A4',printBackground:true,margin:{top:'15mm',bottom:'15mm',left:'12mm',right:'12mm'}});await page.evaluate(()=>document.body.classList.remove('printing-report'));
 }
 assert.equal(writes,writesBeforeDemo);await page.locator('#report-model').selectOption('icpp');assert.ok(await page.locator('#report-content').innerText());await page.locator('#report-model').selectOption('split');await page.locator('#report-demo').click();await page.locator('#demo-notice').waitFor({state:'hidden'});assert.equal(await page.locator('#demo-notice').isVisible(),false);
 }
 assert.deepEqual(errors,[]);await context.close();console.log(`Browser checks ${admin?'admin desktop':'user mobile'} passed`);
}
const login=await browser.newPage({viewport:{width:390,height:844}});await login.goto(base);await login.locator('#auth-form').waitFor();await login.screenshot({path:'qa/login.png'});assert.equal(await login.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await login.close();await browser.close();server.close();
