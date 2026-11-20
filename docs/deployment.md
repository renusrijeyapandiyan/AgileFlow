# Deploying AgileFlow to Render

Two Render services: a **Docker web service** (Spring Boot API) and a **static site** (React build).

## 1. Backend (Web Service)
Render dashboard → New → Web Service → connect the GitHub repo.
- Language/Runtime: **Docker**
- Root Directory: `backend` (Dockerfile Path: `./Dockerfile`)
- Instance type: Free (or Starter)
- Environment variables:
  | Key | Value |
  |---|---|
  | `JWT_SECRET` | a random string of 32+ characters |
  | `CORS_ALLOWED_ORIGINS` | your frontend URL (set after step 2), e.g. `https://agileflow-web.onrender.com` |
- Deploy. Check `https://<api-name>.onrender.com/swagger-ui.html`.

## 2. Frontend (Static Site)
New → Static Site → same repo.
- Root Directory: `frontend`
- Build Command: `npm install && npm run build`
- Publish Directory: `dist`
- Environment variable: `VITE_API_URL` = `https://<api-name>.onrender.com/api`  (**must include `/api`**; it is baked in at build time)
- Redirects/Rewrites tab → add rule: Source `/*`, Destination `/index.html`, Action **Rewrite**.

## 3. Connect them
Go back to the backend service → Environment → set `CORS_ALLOWED_ORIGINS` to the static site URL (no trailing slash) → save (it redeploys).
If you change `VITE_API_URL` later, trigger a manual redeploy of the static site.

## Free-tier limits
- The API **sleeps after ~15 min idle**; the first request afterwards takes about a minute.
- SQLite is a file on an ephemeral disk: **data is lost on every redeploy/restart**. The demo data is re-created automatically on start (`SEED_DEMO=true`), which is fine for a demo. For real persistence use a paid instance with a Disk mounted at `/data` and set `DB_PATH=/data/agileflow.db`.
