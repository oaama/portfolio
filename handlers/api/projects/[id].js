import { getDb, getProjects, setKV, checkAuth, unauthorized } from "../../_lib.js";

function findIndex(projects, id) {
  return projects.findIndex(function (p) { return String(p._id) === String(id) || String(p.id) === String(id); });
}

export async function onRequestPut({ request, env, params }) {
  const db = await getDb(env);
  if (!(await checkAuth(request, db))) return unauthorized();
  let body;
  try { body = await request.json(); } catch (e) { return Response.json({ success: false, error: "Invalid JSON" }, { status: 400 }); }
  const projects = await getProjects(db);
  const i = findIndex(projects, params.id);
  if (i < 0) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  const merged = Object.assign({}, projects[i], body);
  merged._id = projects[i]._id; merged.id = projects[i].id;
  if (typeof merged.tech === "string") merged.tech = merged.tech.split(",").map(function (s) { return s.trim(); }).filter(Boolean);
  projects[i] = merged;
  await setKV(db, "projects", projects);
  return Response.json({ success: true, data: merged });
}

export async function onRequestDelete({ request, env, params }) {
  const db = await getDb(env);
  if (!(await checkAuth(request, db))) return unauthorized();
  const projects = await getProjects(db);
  const next = projects.filter(function (p) { return String(p._id) !== String(params.id) && String(p.id) !== String(params.id); });
  if (next.length === projects.length) return Response.json({ success: false, error: "Not found" }, { status: 404 });
  await setKV(db, "projects", next);
  return Response.json({ success: true });
}
