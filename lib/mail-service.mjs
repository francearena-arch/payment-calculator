import {createHmac,timingSafeEqual} from 'node:crypto';
export const reply=(status,code,extra={})=>Response.json({code,...extra},{status,headers:{'Cache-Control':'no-store'}});
export function sameOrigin(request,env){
 const allowed=new Set([env.URL,env.DEPLOY_PRIME_URL,env.DEPLOY_URL,...(env.MAIL_ALLOWED_ORIGINS||'').split(','),new URL(request.url).origin].filter(Boolean).map(v=>new URL(v.trim()).origin));
 return allowed.has(request.headers.get('origin'))&&request.headers.get('sec-fetch-site')!=='cross-site';
}
export function receipt(id,key,time=Math.floor(Date.now()/1000)){const signature=createHmac('sha256',key).update(`${id}:${time}`).digest('hex');return `${time}.${signature}`;}
export function validReceipt(id,token,key,now=Math.floor(Date.now()/1000)){
 if(!/^\d{10}\.[a-f0-9]{64}$/.test(token||''))return false;
 const time=Number(token.split('.')[0]);if(time>now+30||now-time>600)return false;
 const actual=Buffer.from(token),expected=Buffer.from(receipt(id,key,time));return actual.length===expected.length&&timingSafeEqual(actual,expected);
}
export function providerError(body){const text=String(body?.message||'').toLowerCase();if(text.includes('testing emails')||text.includes('own email'))return 'test_recipient_restricted';if(text.includes('verify')||text.includes('verified')||text.includes('domain'))return 'sender_unverified';return 'delivery';}
