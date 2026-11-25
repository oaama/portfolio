import { getDb, getPortfolio, setKV, checkAuth, unauthorized } from "../_lib.js";

export async function onRequestGet({ request, env }) {
  const db = await getDb(env);
  const p = await getPortfolio(db);
  return Response.json({ success: true, data: p }, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPut({ request, env }) {
  const db = await getDb(env);
  if (!(await checkAuth(request, db))) return unauthorized();
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return Response.json({ success: false, error: "Invalid payload" }, { status: 400 });
  const existing = await getPortfolio(db);
  const keys = ["hero", "about", "techStack", "contact"];
  for (const k of keys) { if (body[k] !== undefined) existing[k] = body[k]; }
  await setKV(db, "portfolio", existing);
  return Response.json({ success: true, data: existing });
}
