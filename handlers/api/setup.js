import { getDb, getKV, setKV, pbkdf2hex, randomHex } from "../_lib.js";

const SETUP_TOKEN = "0947aa8d88c0a6fa15a9059d273aa88af6ee4f7e1da832b1";

export async function onRequestPost({ request, env }) {
  const db = await getDb(env);
  const existing = await getKV(db, "admin");
  if (existing) return Response.json({ success: false, error: "Setup already completed." }, { status: 409 });
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body || body.token !== SETUP_TOKEN) return Response.json({ success: false, error: "Invalid setup token." }, { status: 403 });
  const password = body.password;
  if (typeof password !== "string" || password.length < 10) return Response.json({ success: false, error: "Password must be at least 10 characters." }, { status: 400 });
  const salt = randomHex(16);
  const iterations = 100000;
  const hash = await pbkdf2hex(password, salt, iterations);
  await setKV(db, "admin", { salt: salt, iterations: iterations, hash: hash, createdAt: Date.now() });
  return Response.json({ success: true });
}
