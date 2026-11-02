import test from 'node:test';
import assert from 'node:assert/strict';
import {makeStatusHandler} from '../netlify/functions/mail-status.mjs';
import {receipt,validReceipt} from '../lib/mail-service.mjs';
const env={URL:'https://calculator.example',RESEND_API_KEY:'unit-test-secret'},id='11111111-2222-4333-8444-555555555555';
const request=token=>new Request(env.URL+'/api/mail-status?'+new URLSearchParams({id,receipt:token}),{headers:{origin:env.URL}});
test('receipt is bound to email ID, expires, and rejects forged values',()=>{
 const token=receipt(id,env.RESEND_API_KEY,1700000000);assert.equal(validReceipt(id,token,env.RESEND_API_KEY,1700000500),true);assert.equal(validReceipt(id,token,env.RESEND_API_KEY,1700000700),false);assert.equal(validReceipt('another-id',token,env.RESEND_API_KEY,1700000500),false);
});
test('accepted/sent must not be presented as delivered; confirmed delivery exposes no mail content',async()=>{
 for(const event of ['sent','queued','delivery_delayed','delivered','opened','bounced','failed']){
  const response=await makeStatusHandler({env,send:async()=>Response.json({last_event:event,to:['private@example.com'],html:'private PDF content'})})(request(receipt(id,env.RESEND_API_KEY)));
  const body=await response.json();assert.equal(body.code,['delivered','opened'].includes(event)?'delivered':['bounced','failed'].includes(event)?'failed':'accepted');assert.equal('to' in body,false);assert.equal('html' in body,false);
 }
});
test('status permission or provider failures remain unconfirmed, never delivered',async()=>{
 const response=await makeStatusHandler({env,send:async()=>new Response('{}',{status:403})})(request(receipt(id,env.RESEND_API_KEY)));assert.equal((await response.json()).state,'unknown');
 const forged=await makeStatusHandler({env})(request('forged'));assert.equal(forged.status,403);
});

test('same-origin browser GET without an Origin header can verify a signed delivery receipt',async()=>{const url=env.URL+'/api/mail-status?'+new URLSearchParams({id,receipt:receipt(id,env.RESEND_API_KEY)});const response=await makeStatusHandler({env,send:async()=>Response.json({last_event:'delivered'})})(new Request(url,{headers:{'sec-fetch-site':'same-origin'}}));assert.equal((await response.json()).state,'delivered');const cross=await makeStatusHandler({env})(new Request(url,{headers:{'sec-fetch-site':'cross-site'}}));assert.equal(cross.status,403);});
