import { getDb, getKV, sha256hex, pbkdf2hex, randomHex, getGuard, setGuard } from "../../_lib.js";

export async function onRequestPost({ request, env }) {
  const db = await getDb(env);
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const password = body && body.password;
  if (typeof password !== "string" || password.length === 0) return Response.json({ success: false, error: "Password required" }, { status: 400 });
  const now = Date.now();
  const guard = await getGuard(db);
  if (guard.lockedUntil > now) {
    return Response.json({ success: false, error: "Too many failed attempts. Try again in a few minutes." }, { status: 429 });
  }
  const admin = await getKV(db, "admin");
  if (!admin) return Response.json({ success: false, error: "Dashboard login is not set up yet." }, { status: 403 });
  const suppliedEmail=String(body.email||'').trim().toLowerCase();
  if (!admin.email || suppliedEmail !== admin.email.toLowerCase()) return Response.json({success:false,error:'Invalid email or password'},{status:401});
  const hash = await pbkdf2hex(password, admin.salt, admin.iterations);
  if (hash !== admin.hash) {
    const fails = guard.fails + 1;
    const locked = fails >= 5 ? now + 15 * 60 * 1000 : 0;
    await setGuard(db, fails, locked);
    return Response.json({ success: false, error: "Invalid password" }, { status: 401 });
  }
  await setGuard(db, 0, 0);
  const token = randomHex(24);
  const key = await sha256hex(token);
  await db.collection("sessions").insertOne({ _id: key, expires: now + 7 * 24 * 60 * 60 * 1000 });
  return Response.json({ success: true, token: token });
}
