// Both exports share this ledger. Only provider-accepted requests are recorded.
export function createSendOnce(){
 const accepted=new Set(),pending=new Map();
 return async function sendOnce(snapshot,send){
  const {createdAt,...value}=snapshot,key=JSON.stringify(value);
  if(accepted.has(key))return 'already-sent';
  if(pending.has(key))return pending.get(key);
  const request=Promise.resolve().then(send).then(ok=>{if(ok)accepted.add(key);return ok;}).finally(()=>pending.delete(key));
  pending.set(key,request);return request;
 };
}
