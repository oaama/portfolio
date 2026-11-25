import { getDb, getProjects, setKV, checkAuth, unauthorized } from "../../_lib.js";

export async function onRequestGet({ request, env }) {
  const db = await getDb(env);
  const projects = await getProjects(db);
  return Response.json({ success: true, data: projects, count: projects.length }, { headers: { "Cache-Control": "no-store" } });
}

export async function onRequestPost({ request, env }) {
  const db = await getDb(env);
  if (!(await checkAuth(request, db))) return unauthorized();
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body) || !body.name) return Response.json({ success: false, error: "Missing project name" }, { status: 400 });
  const p = Object.assign({}, body);
  delete p._id; delete p.id;
  if (typeof p.tech === "string") p.tech = p.tech.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  const id = Date.now().toString();
  p.id = id; p._id = id;
  const projects = await getProjects(db);
  projects.push(p);
  await setKV(db, "projects", projects);
  return Response.json({ success: true, data: p });
}
