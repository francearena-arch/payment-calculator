import {createHash} from 'node:crypto';
import {reply,sameOrigin,receipt,providerError} from '../../lib/mail-service.mjs';
export const config={path:'/api/send-pdf',rateLimit:{windowLimit:5,windowSize:60,aggregateBy:['ip','domain']}};
export function makeHandler({env=process.env,send=fetch,pause=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 return async request=>{
  if(request.method!=='POST')return reply(405,'method');
  if(!sameOrigin(request,env))return reply(403,'origin');
  if(!env.RESEND_API_KEY||!env.MAIL_FROM||!env.MAIL_TO)return reply(503,'configuration');
  if(!request.headers.get('content-type')?.startsWith('multipart/form-data'))return reply(415,'type');
  if(Number(request.headers.get('content-length'))>2000000)return reply(413,'size');
  try{
   const buffer=await request.arrayBuffer();if(buffer.byteLength>2000000)return reply(413,'size');
   const data=await new Request(request.url,{method:'POST',headers:{'content-type':request.headers.get('content-type')},body:buffer}).formData();
   const file=data.get('pdf'),id=data.get('comparisonId'),digest=data.get('digest');
   if(!/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id||''))return reply(400,'id');
   if(!file||typeof file==='string'||file.type!=='application/pdf'||file.size>1500000)return reply(400,'pdf');
   const pdf=Buffer.from(await file.arrayBuffer());const actual=createHash('sha256').update(pdf).digest('hex');
   if(pdf.subarray(0,5).toString()!=='%PDF-'||!pdf.subarray(-100).toString().includes('%%EOF')||actual!==digest)return reply(400,'pdf');
   // Fixed recipient and sender are server configuration; client cannot override either.
   const options={method:'POST',headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`,'Content-Type':'application/json','Idempotency-Key':`pcc-${id}-${actual}`},body:JSON.stringify({from:env.MAIL_FROM,to:[env.MAIL_TO],subject:`Payment Calculator - ${id}`,text:`Payment Calculator comparison ${id}. PDF attached.`,attachments:[{filename:`Nexi-Vergleich-${id}.pdf`,content:pdf.toString('base64') }]}),signal:AbortSignal.timeout(10000)};
   let response;for(let attempt=0;attempt<2;attempt++){try{response=await send('https://api.resend.com/emails',{...options,signal:AbortSignal.timeout(10000)});if(response.status!==429&&response.status<500)break;}catch(error){if(attempt===1)throw error;}if(attempt===0)await pause(500);}
   const body=await response.json().catch(()=>({}));
   if(!response.ok){const code=response.status===401?'authentication':response.status===429?'rate_limit':providerError(body);console.warn('pdf-mail-failure',{comparisonId:id,status:response.status,code});return reply(response.status===429?429:502,code);}
   if(!/^[a-f0-9-]{36}$/i.test(body.id||''))return reply(502,'delivery');
   console.info('pdf-mail-accepted',{comparisonId:id,emailId:body.id});return reply(200,'accepted',{emailId:body.id,receipt:receipt(body.id,env.RESEND_API_KEY)});
  }catch{return reply(502,'delivery');}
 };
}
export default makeHandler();
