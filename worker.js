import * as bootstrapApi from "./handlers/api/bootstrap.js";
import * as portfolio from "./handlers/api/portfolio.js";
import * as projectsIndex from "./handlers/api/projects/index.js";
import * as projectsId from "./handlers/api/projects/[id].js";
import * as password from "./handlers/api/auth/password.js";
import * as login from "./handlers/api/auth/login.js";
import * as setup from "./handlers/api/setup.js";
import * as rotate from "./handlers/api/rotate.js";


const PRIVATE_PATHS = ["/dash-admin", "/login", "/rotate", "/setup", "/index-legacy.html"];

function isPrivatePath(p) {
  return PRIVATE_PATHS.some((x) => p === x || p.startsWith(x + "/"));
}

async function serveAsset(request, env) {
  const pathname = new URL(request.url).pathname;
  let res = await env.ASSETS.fetch(request);
  const type = res.headers.get("content-type") || "";
  if (!type.includes("text/html")) return res;
  const headers = new Headers(res.headers);
  if (isPrivatePath(pathname)) headers.set("X-Robots-Tag", "noindex, nofollow");
  res = new Response(res.body, { status: res.status, statusText: res.statusText, headers });
  const token = env.GOOGLE_SITE_VERIFICATION;
  if (token) {
    const safe = String(token).replace(/["<>]/g, "");
    res = new HTMLRewriter()
      .on("head", {
        element(el) {
          el.append(`<meta name="google-site-verification" content="${safe}"/>`, { html: true });
        },
      })
      .transform(res);
  }
  return res;
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const p = url.pathname;
    const m = request.method;
    try {
      if (p === "/api/bootstrap" && m === "GET") return await bootstrapApi.onRequestGet({ request, env });
      if (p === "/api/portfolio") {
        if (m === "GET") return await portfolio.onRequestGet({ request, env });
        if (m === "PUT") return await portfolio.onRequestPut({ request, env });
      }
      if (p === "/api/projects") {
        if (m === "GET") return await projectsIndex.onRequestGet({ request, env });
        if (m === "POST") return await projectsIndex.onRequestPost({ request, env });
      }
      const pm = p.match(/^\/api\/projects\/([^/]+)$/);
      if (pm) {
        const params = { id: decodeURIComponent(pm[1]) };
        if (m === "PUT") return await projectsId.onRequestPut({ request, env, params });
        if (m === "DELETE") return await projectsId.onRequestDelete({ request, env, params });
      }
      if (p === "/api/auth/password" && m === "PUT") return await password.onRequestPut({request,env});
      if (p === "/api/auth/login" && m === "POST") return await login.onRequestPost({ request, env });
      if (p === "/api/setup" && m === "POST") return await setup.onRequestPost({ request, env });
      if (p === "/api/rotate" && m === "POST") return await rotate.onRequestPost({ request, env });
      if (p.startsWith("/api/")) return Response.json({ success: false, error: "Not found" }, { status: 404 });
      return await serveAsset(request, env);
    } catch (e) {
            return Response.json({ success: false, error: "Internal error" }, { status: 500 });
    }
  }
};
