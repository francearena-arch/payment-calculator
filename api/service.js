import {createClient} from '@supabase/supabase-js';
import {validateSubmission} from '../lib/domain.js';
export const makeHandler=(factory=createClient)=>async function handler(req,res){
 res.setHeader('Cache-Control','no-store');
 if(req.method!=='POST')return res.status(405).json({error:'POST required'});
 if(!process.env.SUPABASE_URL||!process.env.SUPABASE_SECRET_KEY||!process.env.APP_URL)return res.status(503).json({error:'Server configuration missing'});
 if(req.headers.origin&&req.headers.origin!==new URL(process.env.APP_URL).origin)return res.status(403).json({error:'Origin denied'});
 const db=factory(process.env.SUPABASE_URL,process.env.SUPABASE_SECRET_KEY,{auth:{persistSession:false,autoRefreshToken:false}});
 const token=(req.headers.authorization||'').replace(/^Bearer /,'');
 const {data:auth,error:authError}=await db.auth.getUser(token);
 if(authError||!auth?.user?.email_confirmed_at)return res.status(401).json({error:'Login required'});
 const {data:p,error:profileError}=await db.from('pcc_profiles').select('*').eq('user_id',auth.user.id).single();
 if(profileError||!p?.active)return res.status(403).json({error:'Access disabled'});
 const b=req.body||{},action=b.action;
 const adminActions=['users','invite','suspend','restore','deleteUser','report','review'];
 if(adminActions.includes(action)&&!p.is_admin)return res.status(403).json({error:'Admin required'});
 let aal='aal1';try{aal=JSON.parse(Buffer.from(token.split('.')[1],'base64url').toString()).aal||'aal1';}catch{}
 if(adminActions.includes(action)&&aal!=='aal2')return res.status(403).json({error:'Admin MFA required'});
 const checked=async promise=>{const {data,error}=await promise;if(error)throw error;return data;};
 const audit=async(target)=>checked(db.from('pcc_audit').insert({actor_id:p.user_id,action,target_id:target}));
 try{
 if(action==='me')return res.json({profile:{email:p.email,is_admin:p.is_admin}});
 if(action==='submit'){
  if(typeof b.request_id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(b.request_id))return res.status(400).json({error:'Invalid request ID'});
  const row=validateSubmission(b.case);row.owner_id=p.user_id;row.id=b.request_id;
  const {data:existing}=await db.from('pcc_cases').select('id').eq('id',row.id).eq('owner_id',p.user_id).maybeSingle();if(existing)return res.json(existing);
  const out=await checked(db.from('pcc_cases').insert(row).select('id').single());return res.json(out);
 }
 if(action==='cases')return res.json({cases:await checked(db.from('pcc_cases').select('id,competitor,quote_date,channel,purpose,industry,turnover_band,status,outcome,offered_option,closed_date,payload').eq('owner_id',p.user_id).order('created_at',{ascending:false}).limit(500))});
 if(action==='outcome'){
  if(!['open','retained','lost'].includes(b.outcome))return res.status(400).json({error:'Invalid outcome'});
  const old=await checked(db.from('pcc_cases').select('*').eq('id',b.id).eq('owner_id',p.user_id).single());
  if(old.purpose!=='retention')return res.status(400).json({error:'Retention case required'});
  if(!Number.isInteger(b.offered_option)||old.payload.offers[b.offered_option]?.provider!=='Nexi')return res.status(400).json({error:'Select actual Nexi proposition'});
  await checked(db.from('pcc_cases').update({outcome:b.outcome,offered_option:b.offered_option,closed_date:b.outcome==='open'?null:new Intl.DateTimeFormat('en-CA',{timeZone:'Europe/Zurich'}).format(new Date())}).eq('id',b.id).eq('owner_id',p.user_id));await audit(b.id);return res.json({ok:true});
 }
 if(action==='report'){
  const cases=[];
  for(let start=0;start<5000;start+=1000){
   const page=await checked(db.from('pcc_cases').select('*').order('quote_date',{ascending:false}).order('id',{ascending:false}).range(start,start+999));
   cases.push(...page);if(page.length<1000)break;
  }
  return res.json({cases,limit:5000});
 }
 if(action==='review'){
  if(!['approved','rejected'].includes(b.status))return res.status(400).json({error:'Invalid status'});
  await checked(db.from('pcc_cases').update({status:b.status,reviewed_by:p.user_id,reviewed_at:new Date().toISOString()}).eq('id',b.id));await audit(b.id);return res.json({ok:true});
 }
 if(action==='users')return res.json({users:await checked(db.from('pcc_profiles').select('user_id,email,is_admin,active,created_at').order('created_at'))});
 if(action==='invite'){
  if(typeof b.email!=='string'||b.email.length>254||! /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(b.email))return res.status(400).json({error:'Invalid email'});
  const {data,error}=await db.auth.admin.inviteUserByEmail(b.email.trim().toLowerCase(),{redirectTo:process.env.APP_URL+'/'});if(error)throw error;await checked(db.from('pcc_profiles').update({active:true}).eq('user_id',data.user.id));await audit(data.user.id);return res.json({ok:true});
 }
 if(action==='suspend'||action==='restore'||action==='deleteUser'){
  const target=await checked(db.from('pcc_profiles').select('*').eq('user_id',b.id).single());
  if(target.is_admin||target.user_id===p.user_id)return res.status(400).json({error:'Admin accounts protected; manage in Supabase'});
  if(action==='suspend'){
   await checked(db.from('pcc_profiles').update({active:false}).eq('user_id',b.id));
   const {error}=await db.auth.admin.updateUserById(b.id,{ban_duration:'876000h'});if(error)throw error;
  }else if(action==='restore'){const {error}=await db.auth.admin.updateUserById(b.id,{ban_duration:'none'});if(error)throw error;await checked(db.from('pcc_profiles').update({active:true}).eq('user_id',b.id));}else{const {error}=await db.auth.admin.deleteUser(b.id);if(error)throw error;}
  await audit(b.id);return res.json({ok:true});
 }
 return res.status(400).json({error:'Unknown action'});
 }catch(e){console.error('PCC operation failed',action,e.code||e.name);return res.status(400).json({error:'Operation failed. Check input, database setup or email delivery.'});}
};
export default makeHandler();
