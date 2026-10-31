import {reply,sameOrigin,validReceipt} from '../../lib/mail-service.mjs';
export const config={path:'/api/mail-status',rateLimit:{windowLimit:30,windowSize:60,aggregateBy:['ip','domain']}};
export function makeStatusHandler({env=process.env,send=fetch}={}){return async request=>{
 if(request.method!=='GET')return reply(405,'method');if(!sameOrigin(request,env))return reply(403,'origin');if(!env.RESEND_API_KEY)return reply(503,'configuration');
 const url=new URL(request.url),id=url.searchParams.get('id'),token=url.searchParams.get('receipt');
 if(!/^[a-f0-9-]{36}$/i.test(id||'')||!validReceipt(id,token,env.RESEND_API_KEY))return reply(403,'receipt');
 try{const response=await send(`https://api.resend.com/emails/${id}`,{headers:{Authorization:`Bearer ${env.RESEND_API_KEY}`},signal:AbortSignal.timeout(5000)});
  if(!response.ok)return reply(200,'accepted',{state:'unknown'});
  const email=await response.json(),state=email.last_event;
  if(['delivered','opened','clicked'].includes(state))return reply(200,'delivered',{state:'delivered'});
  if(['bounced','failed','suppressed','complained','canceled'].includes(state))return reply(200,'failed',{state:'failed'});
  return reply(200,'accepted',{state:['sent','queued','delivery_delayed','scheduled'].includes(state)?state:'unknown'});
 }catch{return reply(200,'accepted',{state:'unknown'});}
};}
export default makeStatusHandler();
