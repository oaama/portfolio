<div align="center">

# 👨‍💻 Angelo Rezq — Portfolio

**Serverless personal portfolio with a password-protected admin dashboard for live content editing**

[![Live Demo](https://img.shields.io/badge/🚀_Live_Site-Visit-success?style=for-the-badge)](https://eng-angluos-rezq.angluosr.workers.dev)

[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-F38020?style=flat-square&logo=cloudflareworkers&logoColor=white)](https://workers.cloudflare.com)
[![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat-square&logo=javascript&logoColor=black)](https://developer.mozilla.org/docs/Web/JavaScript)
[![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat-square&logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://www.mongodb.com)

</div>

---

## 🌐 Live

- **Site:** [eng-angluos-rezq.angluosr.workers.dev](https://eng-angluos-rezq.angluosr.workers.dev)
- **Admin dashboard:** [eng-angluos-rezq.angluosr.workers.dev/dash-admin](https://eng-angluos-rezq.angluosr.workers.dev/dash-admin)

## ✨ Features

- 🖥️ **Responsive portfolio** for web and mobile projects — categories, project detail pages, image galleries and technology tags.
- ✏️ **Admin dashboard** — password-protected studio for editing and publishing hero, biography, ventures, skills and contact sections without a redeploy.
- 🗄️ **Database-backed content** — every section is stored as a document and published instantly from the dashboard.
- 📱 **Mobile-first navigation**, project filtering and dedicated project detail pages.
- 🔎 **SEO built in** — static metadata, sitemap and robots rules served from the edge.
- 🔐 **Hardened auth** — PBKDF2-SHA256 password hashing (100k iterations), 7-day sessions, and lockout after failed sign-in attempts.

## 🛠️ Tech Stack

| Layer | Choice |
| --- | --- |
| Runtime | Cloudflare Workers (serverless, edge) |
| Frontend | Static HTML/CSS/JS assets |
| Dashboard | Next.js (static export) |
| Database | MongoDB Atlas |
| Auth | Web Crypto (PBKDF2-SHA256, bearer sessions) |

## 🚀 Getting Started

```bash
npm install
npx wrangler dev      # local development
npx wrangler deploy   # publish to the edge
```

---

<div align="center">

## 👨‍💻 Developed by [Angelo Rezq](https://github.com/angelo-rezq)

**Full-Stack Developer · Flutter · Next.js · React**

[![Portfolio](https://img.shields.io/badge/Eng_Angluos_Rezq-black?style=for-the-badge)](https://eng-angluos-rezq.angluosr.workers.dev)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-Chat-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/201127570256)
[![Email](https://img.shields.io/badge/Email-angelo.rezq.dev%40gmail.com-EA4335?style=for-the-badge&logo=gmail&logoColor=white)](mailto:angelo.rezq.dev@gmail.com)

</div>

## SEO and Google Search Console

The production site is `https://eng-angluos-rezq.angluosr.workers.dev`.

- `public/sitemap.xml` lists every public page (home, project case studies,
  privacy, terms) with `hreflang` alternates for `en` and `ar`.
- `public/robots.txt` allows public pages and blocks `/dash-admin`,
  `/login`, `/rotate`, `/setup` and `/index-legacy.html`.
- Unknown paths serve `public/404.html` with a real 404 status.
- Private pages also send an `X-Robots-Tag: noindex, nofollow` header and a
  `noindex` meta tag.

### Verify the site in Google Search Console (one-time, manual)

1. Open <https://search.google.com/search-console> and choose **Add
   property** -> **URL prefix**, then enter
   `https://eng-angluos-rezq.angluosr.workers.dev`.
2. Pick the **HTML tag** verification method and copy the token from the
   `content` attribute of the meta tag Google shows.
3. Add the token as the worker variable `GOOGLE_SITE_VERIFICATION` in
   `wrangler.toml` under `[vars]`, then redeploy with
   `npx wrangler deploy --name eng-angluos-rezq` or push to `main` (the
   connected Cloudflare build deploys automatically). The token is public by
   design (Google requires it in a served meta tag), so committing it is
   safe and keeps it attached to every deploy. The current token is already
   set. The worker injects the `<meta name="google-site-verification">` tag
   into every HTML page only while this variable is set.
4. Back in Search Console, click **Verify**.
5. After verification, go to **Sitemaps** and submit
   `https://eng-angluos-rezq.angluosr.workers.dev/sitemap.xml`.
6. Use **URL Inspection** on the home page (and any important project page)
   and choose **Request Indexing**.

Indexing is confirmed only inside Search Console; implementing the above
does not by itself make the site indexed or ranked.

