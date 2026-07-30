# Deploying Noor to Render

This is a TanStack Start (Vite + Nitro) SSR app. It must be deployed as a
**Web Service** — not a Static Site — so server-side rendering works.

---

## Option A — Deploy via `render.yaml` (recommended)

1. Push this folder to a GitHub repo.
2. In the Render dashboard click **New → Blueprint** and point it at your repo.
3. Render reads `render.yaml` automatically and creates the service with all the
   right settings.

---

## Option B — Manual web service

| Setting | Value |
|---|---|
| Environment | **Node** |
| Node version | **20** (`.nvmrc` is included) |
| Build command | `npm install && npm run build` |
| Start command | `node .output/server/index.mjs` |
| Health check path | `/` |

**Environment variables (required):**

| Key | Value |
|---|---|
| `NITRO_PRESET` | `node-server` |
| `NODE_ENV` | `production` |

> `NITRO_PRESET=node-server` is **required**. Without it Nitro targets Cloudflare
> Workers and the build output won't run on Node.

---

## Local smoke-test before pushing

```bash
npm install
NITRO_PRESET=node-server npm run build
node .output/server/index.mjs
# open http://localhost:3000
```

---

## Notes

- Render injects `PORT` automatically; the `node-server` preset reads it.
- The app fetches Quran data from `api.alquran.cloud` and audio from
  `cdn.islamic.network` at runtime — no secrets or databases needed.
- Free-tier services spin down after 15 minutes of inactivity. The first
  request after a cold start may take ~30 s.
