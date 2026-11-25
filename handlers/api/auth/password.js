import { getDb, getKV, setKV, setGuard, checkAuth, unauthorized, pbkdf2hex, randomHex, sha256hex } from '../../_lib.js';
export async function onRequestPut({request,env}) {
 const db=await getDb(env);
 if (!(await checkAuth(request,db))) return unauthorized();
 let b;try{b=await request.json()}catch{return Response.json({success:false,error:'Invalid JSON'},{status:400})}
 if(typeof b.password!=='string'||b.password.length<8)return Response.json({success:false,error:'Use at least 8 characters'},{status:400});
 const salt=randomHex(16),iterations=100000,hash=await pbkdf2hex(b.password,salt,iterations);
 const existing=await getKV(db,'admin');
 await setKV(db,'admin',{...existing,salt,iterations,hash,createdAt:Date.now()});
 const keep=(request.headers.get('Authorization')||'').slice(7).trim();
 await db.collection('sessions').deleteMany({_id:{$ne:await sha256hex(keep)}});
 await setGuard(db,0,0);
 return Response.json({success:true});
}
