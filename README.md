# Einthusan TV Web

A Netflix-style streaming front-end for [Einthusan.tv](https://einthusan.tv), supporting **Tamil**, **Hindi**, and **Malayalam**.

![Netflix-inspired UI with hero banner, movie rows, search, and language filter]

## Features

- Netflix-style home page with hero banner, curated row titles, and horizontal carousels
- **Continue Watching** — resume where you left off (saved locally; syncs when signed in)
- **My List** — save titles to watch later
- **Sign in / Register** — sync your list across devices
- **Movie details** on watch pages — cast, director, genre, and user rating scraped from Einthusan
- Language filter (Tamil / Hindi / Malayalam)
- Search with language-scoped results
- MP4 streaming with progress tracking
- **Install as a web app** on iOS and Android — see [docs/INSTALL.md](docs/INSTALL.md)
- Deployable to **GitHub Pages** (static UI) + **Cloudflare Workers** (API + auth)

## Architecture

GitHub Pages hosts the React UI only. Because Einthusan blocks direct browser requests (CORS) and HLS segments need a proxy, a small **Cloudflare Worker** fetches catalog data and streams on your behalf.

```
Browser (GitHub Pages)  →  Cloudflare Worker  →  einthusan.tv / CDN
```

## Quick start (local)

### 1. Install dependencies

```bash
npm install
cd worker && npm install && cd ..
```

### 2. Start the API worker

```bash
npm run worker:dev
```

The worker runs at `http://127.0.0.1:8787`.

### 3. Start the web app

In a second terminal:

```bash
npm run dev
```

Open `http://localhost:5173`. Vite proxies `/api/*` to the worker automatically.

## Deploy

### Live URLs

| Component | URL |
|-----------|-----|
| **Frontend (custom domain)** | https://einthusan.mainframe.website/ |
| **Frontend (GitHub Pages fallback)** | https://karlogin.github.io/Enithusan-TV-Web/ |
| **API (Cloudflare Worker)** | https://einthusan-tv-api.einthusan-karthik.workers.dev/api |

### Step 1 — Deploy the Cloudflare Worker (required)

The frontend needs a live API. Choose **one** method:

#### Option A: Deploy from your machine (quickest)

If https://dash.cloudflare.com/.../workers/onboarding shows an error, register your subdomain via API first:

```bash
chmod +x scripts/register-workers-subdomain.sh
./scripts/register-workers-subdomain.sh einthusan-karthik   # pick a unique name
```

Or use the dashboard: **Cloudflare → Workers & Pages** (not the onboarding link) → set **Your subdomain**.

Then deploy:

```bash
cd worker
npm install
npx wrangler login          # opens browser — approve Cloudflare access
npx wrangler deploy
```

Copy the worker URL shown (e.g. `https://einthusan-tv-api.einthusan-karthik.workers.dev`).

> SSL for a new `*.workers.dev` subdomain can take a few minutes to become reachable.

#### Option B: Deploy via GitHub Actions

1. Create a [Cloudflare API token](https://dash.cloudflare.com/profile/api-tokens) with **Edit Cloudflare Workers** permission
2. In GitHub → **Enithusan-TV-Web** → **Settings → Secrets and variables → Actions**, add:
   - `CLOUDFLARE_API_TOKEN` — your token
   - `CLOUDFLARE_ACCOUNT_ID` — from Cloudflare dashboard → Workers overview (right sidebar)
3. Run **Actions → Deploy Cloudflare Worker → Run workflow**

### Step 2 — Connect frontend to the API

In GitHub → **Settings → Secrets and variables → Actions → Variables**, add:

| Variable | Example value |
|----------|---------------|
| `VITE_API_BASE` | `https://einthusan-tv-api.your-subdomain.workers.dev/api` |

Then re-run **Actions → Deploy to GitHub Pages → Run workflow** (or push any commit to `main`).

### Step 3 — Verify

Open https://einthusan.mainframe.website/ — you should see movie rows load and playback work.

### Custom domain (Cloudflare DNS)

The site is configured for **einthusan.mainframe.website** on your `mainframe.website` zone. In [Cloudflare DNS](https://dash.cloudflare.com/86d1fcd3848963e4e830d89aec3e1354/mainframe.website/dns):

| Type | Name | Target | Proxy |
|------|------|--------|-------|
| CNAME | `einthusan` | `karlogin.github.io` | DNS only (grey cloud) |

GitHub provisions HTTPS once DNS resolves. SSL can take up to 24 hours; usually a few minutes.

> **Note:** The repo is public (required for free GitHub Pages). To use a private repo, upgrade to GitHub Pro or host the frontend on Cloudflare Pages instead.

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Worker API base URL (required for production) |
| `VITE_BASE_PATH` | Site base path (auto-set in CI) |

### Worker secrets (optional)

```bash
cd worker
npx wrangler secret put AUTH_SECRET    # random string for production auth
```

Copy `.env.example` to `.env.local` for local overrides:

```bash
cp .env.example .env.local
```

## API endpoints (Worker)

| Endpoint | Description |
|----------|-------------|
| `GET /api/home?lang=tamil` | Home page catalog + featured rows |
| `GET /api/search?q=kara&lang=tamil` | Search movies |
| `GET /api/movie/:id?lang=tamil` | Movie details, stream URLs, cast & crew |
| `GET /api/stream?url=...` | Proxied HLS manifest/segments |
| `POST /api/auth/register` | Create account |
| `POST /api/auth/login` | Sign in |
| `GET /api/auth/me` | Current user (Bearer token) |
| `GET/PUT /api/user/library` | My List + Continue Watching sync |

## Supported languages

- Tamil (`tamil`)
- Hindi (`hindi`)
- Malayalam (`malayalam`)

## Tech stack

- React 18 + TypeScript + Vite
- React Router
- hls.js for adaptive streaming
- Cloudflare Workers for API proxy

## Disclaimer

This project is an unofficial front-end for personal use. Content belongs to Einthusan and respective rights holders. Ensure you comply with applicable laws and terms of service in your region.
