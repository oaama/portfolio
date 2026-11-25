// Data-access layer: all persistence logic against a MongoDB db handle.
// Handlers get `db` from _lib.js (cached MongoClient). Tests inject a fake.

import { SEED_PORTFOLIO, SEED_PROJECTS } from "./_seed.js";

export async function getKV(db, key) {
  const row = await db.collection("kv").findOne({ _id: key });
  return row ? row.value : null;
}

export async function setKV(db, key, value) {
  await db.collection("kv").replaceOne({ _id: key }, { _id: key, value: value }, { upsert: true });
}

export async function getPortfolio(db) {
  const p = await getKV(db, "portfolio");
  if (p) return p;
  await setKV(db, "portfolio", SEED_PORTFOLIO);
  return SEED_PORTFOLIO;
}

export async function getProjects(db) {
  const p = await getKV(db, "projects");
  if (p) return p;
  const seeded = SEED_PROJECTS.map(function (pr) { const c = Object.assign({}, pr); c._id = String(pr.id); return c; });
  await setKV(db, "projects", seeded);
  return seeded;
}

export async function sha256hex(str) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(str));
  return Array.from(new Uint8Array(buf)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

export async function checkAuth(request, db) {
  const h = request.headers.get("Authorization") || "";
  if (!h.startsWith("Bearer ")) return false;
  const tok = h.slice(7).trim();
  if (tok.length < 20) return false;
  const key = await sha256hex(tok);
  const row = await db.collection("sessions").findOne({ _id: key });
  if (!row) return false;
  if (row.expires < Date.now()) {
    await db.collection("sessions").deleteOne({ _id: key });
    return false;
  }
  return true;
}

export function unauthorized() {
  return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
}

export async function pbkdf2hex(password, saltHex, iterations) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const salt = new Uint8Array(saltHex.match(/../g).map(function (h) { return parseInt(h, 16); }));
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: salt, iterations: iterations }, key, 256);
  return Array.from(new Uint8Array(bits)).map(function (b) { return b.toString(16).padStart(2, "0"); }).join("");
}

export function randomHex(n) {
  const b = new Uint8Array(n);
  crypto.getRandomValues(b);
  return Array.from(b).map(function (x) { return x.toString(16).padStart(2, "0"); }).join("");
}

export async function getGuard(db) {
  const row = await db.collection("guard").findOne({ _id: "login" });
  return row || { fails: 0, lockedUntil: 0 };
}

export async function setGuard(db, fails, lockedUntil) {
  await db.collection("guard").replaceOne({ _id: "login" }, { _id: "login", fails: fails, lockedUntil: lockedUntil }, { upsert: true });
}
