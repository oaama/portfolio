import { getDb, getKV, setKV, setGuard, pbkdf2hex, randomHex } from "../_lib.js";

// One-time admin password rotation, used once on 2026-11-23 for the user-chosen
// password. Self-disables after first success (409 afterwards), same pattern as setup.js.
const ROTATE_TOKEN = "bd3a2074d16d40aa1996c4f92f348168"; // second one-time rotation for the unified password, 2026-11-23

export async function onRequestPost({ request, env }) {
  const db = await getDb(env);
  const done = await getKV(db, "rotate2_consumed");
  if (done) return Response.json({ success: false, error: "Rotation already completed." }, { status: 409 });
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body || body.token !== ROTATE_TOKEN) return Response.json({ success: false, error: "Invalid token." }, { status: 403 });
  const password = body.password;
  if (typeof password !== "string" || password.length < 8) return Response.json({ success: false, error: "Password must be at least 8 characters." }, { status: 400 });
  const salt = randomHex(16);
  const iterations = 100000;
  const hash = await pbkdf2hex(password, salt, iterations);
  await setKV(db, "admin", { salt: salt, iterations: iterations, hash: hash, createdAt: Date.now() });
  await setKV(db, "rotate2_consumed", true);
  await db.collection("sessions").deleteMany({});
  await setGuard(db, 0, 0);
  return Response.json({ success: true });
}
