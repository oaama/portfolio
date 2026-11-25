import { getDb, getPortfolio, getProjects } from "../_lib.js";

export async function onRequestGet({ request, env }) {
  const db = await getDb(env);
  const portfolio = await getPortfolio(db);
  const projects = await getProjects(db);
  const mapped = projects.map(function (p) { const c = Object.assign({}, p); c.id = String(p.id || p._id); return c; });
  const data = { hero: portfolio.hero, about: portfolio.about, techStack: portfolio.techStack, contact: portfolio.contact, projects: mapped };
  return new Response(JSON.stringify({ success: true, data: data }), {
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" }
  });
}
