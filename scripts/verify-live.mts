import {createClient} from '@supabase/supabase-js';
import {createServerClient} from '@supabase/ssr';
import {randomUUID,randomBytes} from 'node:crypto';
import {isDeepStrictEqual} from 'node:util';
import {emptyModel} from '../src/lib/model-schema';
import {calculateFinance} from '../src/lib/finance';
const url=process.env.NEXT_PUBLIC_SUPABASE_URL!,key=process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,serviceKey=process.env.SUPABASE_SERVICE_ROLE_KEY!;
if(!url||!key||!serviceKey)throw new Error('Live Supabase configuration required');
const origin=process.argv[2]??'http://127.0.0.1:3000',service=createClient(url,serviceKey,{auth:{persistSession:false}}),anonymous=createClient(url,key,{auth:{persistSession:false}}),prefix=`tsk-test-${randomUUID()}`;
const users:string[]=[],records:string[]=[],paths:string[]=[],emails:string[]=[],checks:string[]=[];
const assert=(ok:unknown,message:string)=>{if(!ok)throw new Error(message);checks.push(message);};
async function user(role:'admin'|'contributor'){
 const email=`${prefix}-${role}@example.test`,password=randomBytes(30).toString('hex');emails.push(email);
 const {data,error}=await service.auth.admin.createUser({email,password,email_confirm:true});if(error||!data.user)throw error??new Error('No test identity');users.push(data.user.id);
 if(role==='admin'){const {error}=await service.from('memberships').insert({user_id:data.user.id,role,display_name:'TEMPORARY VERIFICATION'});if(error)throw error;}
 let cookies:{name:string;value:string}[]=[];const client=createServerClient(url,key,{cookies:{getAll:()=>cookies,setAll:cs=>{cookies=cs;}}});
 const {error:signError}=await client.auth.signInWithPassword({email,password});if(signError)throw signError;
 return{client,id:data.user.id,email,headers:()=>({'Content-Type':'application/json',Origin:origin,Cookie:cookies.map(c=>`${c.name}=${c.value}`).join('; ')})};
}
try{
 const admin=await user('admin'),contributor=await user('contributor');
 const invoke=async(who:typeof admin,body:unknown)=>{const r=await fetch(origin+'/api/workspace',{method:'POST',headers:who.headers(),body:JSON.stringify(body)});return{status:r.status,data:await r.json()};};
 assert((await invoke(contributor,{action:'create',kind:'contribution',title:'TEST',body:{},rationale:'Uninvited verification'})).status===401,'Uninvited identity denied by app');
 assert((await invoke(admin,{action:'invite',email:contributor.email,role:'contributor',revoke:false})).status===200,'Administrator authorizes account without email');
 const accepted=await contributor.client.rpc('accept_invitation');assert(accepted.data===true,'Verified invitation accepted');
 const draft=await invoke(contributor,{action:'create',kind:'contribution',title:`TEMPORARY TEST ${prefix}`,body:{note:'Synthetic integration check. Not project evidence.',classification:'assumption'},rationale:'Automated verification only'});assert(draft.status===200,'Contributor saves draft through app');records.push(draft.data.record.id);
 assert((await anonymous.from('records').select('*').eq('id',records[0]!)).data?.length===0,'Anonymous cannot read private draft');
 assert((await invoke(contributor,{action:'publish',id:records[0],version:1,rationale:'Unauthorized test publish'})).status!==200,'Contributor publication denied');
 assert((await invoke(admin,{action:'publish',id:records[0],version:1,rationale:'Temporary integration verification'})).status===200,'Administrator publishes through app');
 assert((await anonymous.from('records').select('*').eq('id',records[0]!)).data?.length===1,'Published finding visible to anonymous');
 assert((await invoke(admin,{action:'publish',id:records[0],version:1,rationale:'Stale publication attempt'})).status===409,'Stale version rejected');
 const input=emptyModel();input.name='SYNTHETIC INTEGRATION MODEL';
 const model=await invoke(contributor,{action:'create',kind:'model',title:input.name,body:{input},rationale:'Test model reproducibility'});assert(model.status===200,'Model saved through validated endpoint');records.push(model.data.record.id);
 assert(isDeepStrictEqual(model.data.record.body.result,calculateFinance(input)),'Saved model reproduces engine output');
 const content=new Blob(['%PDF-1.4\n% Synthetic verification attachment\n%%EOF'],{type:'application/pdf'});
 const uploadResponse=await fetch(origin+'/api/uploads',{method:'POST',headers:contributor.headers(),body:JSON.stringify({name:'verification.pdf',mime:'application/pdf',size:content.size,title:`TEMPORARY TEST FILE ${prefix}`,rationale:'Synthetic storage verification',issueId:records[0]})});const upload=await uploadResponse.json();assert(uploadResponse.status===200,'App issues scoped upload capability');records.push(upload.id);paths.push(upload.path);
 const uploaded=await contributor.client.storage.from('evidence').uploadToSignedUrl(upload.path,upload.token,content,{contentType:'application/pdf'});assert(!uploaded.error,'Private evidence upload succeeds');
 assert((await fetch(`${origin}/api/documents/${upload.id}`)).status===404,'Unpublished attachment denied to public');
 assert((await invoke(admin,{action:'publish',id:upload.id,version:1,rationale:'Signature and ownership checked'})).status===200,'Attachment validated and published');
 const file=await fetch(`${origin}/api/documents/${upload.id}`);assert(file.status===200&&(await file.text()).startsWith('%PDF-'),'Published attachment downloads correctly');
 assert((await invoke(admin,{action:'invite',email:contributor.email,role:'contributor',revoke:true})).status===200,'Administrator revokes collaborator');
 assert((await invoke(contributor,{action:'create',kind:'contribution',title:'TEST',body:{},rationale:'Revoked identity check'})).status===401,'Revoked identity immediately denied');
 const authSettings=await fetch(url+'/auth/v1/settings',{headers:{apikey:key}}).then(r=>r.json());
 console.log(JSON.stringify({checks,googleOAuthEnabled:authSettings.external?.google===true},null,2));
}finally{
 if(paths.length){const {error}=await service.storage.from('evidence').remove(paths);if(error)throw error;}
 if(records.length){const revisions=await service.from('revisions').delete().in('record_id',records);if(revisions.error)throw revisions.error;const removed=await service.from('records').delete().in('id',records);if(removed.error)throw removed.error;}
 if(emails.length){const {error}=await service.from('invitations').delete().in('email',emails);if(error)throw error;}
 for(const id of users){const {error}=await service.auth.admin.deleteUser(id);if(error)throw error;}
 console.log('Temporary test identities, records and files removed.');
}
