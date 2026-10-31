import test from 'node:test';
import assert from 'node:assert/strict';
import {createSendOnce} from '../lib/send-once.js';
test('PDF and JSON share one accepted send, including concurrent exports',async()=>{
 const send=createSendOnce();let calls=0;const action=async()=>{calls++;return true;};
 await Promise.all([send({id:1,total:20},action),send({id:1,total:20},action)]);
 assert.equal(await send({id:1,total:20,createdAt:'later'},action),'already-sent');assert.equal(calls,1);
 await send({id:1,total:21},action);assert.equal(calls,2);
});
test('failed requests remain retryable',async()=>{const send=createSendOnce();let calls=0;const action=async()=>++calls>1;assert.equal(await send({id:1},action),false);assert.equal(await send({id:1},action),true);assert.equal(calls,2);});
