# Einthusan TV Web

A Netflix-style streaming front-end for [Einthusan.tv](https://einthusan.tv), supporting **Tamil**, **Hindi**, and **Malayalam**.

![Netflix-inspired UI with hero banner, movie rows, search, and language filter]

## Features

- Netflix-like home page with hero banner and horizontal movie rows
- Language filter (Tamil / Hindi / Malayalam) in the navbar
- Search with language-scoped results
- HLS video playback with quality streaming
- Deployable to **GitHub Pages** (static UI) + **Cloudflare Workers** (API proxy)

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

### Step 1 — Deploy the Cloudflare Worker (free)

1. Create a [Cloudflare](https://cloudflare.com) account
2. Install Wrangler: `npm install -g wrangler`
3. Log in: `wrangler login`
4. Deploy:

```bash
cd worker
npm run deploy
```

Note the worker URL, e.g. `https://einthusan-tv-api.your-name.workers.dev`.

### Step 2 — Deploy to GitHub Pages

1. Push this repo to [github.com/karlogin/Enithusan-TV-Web](https://github.com/karlogin/Enithusan-TV-Web)
2. In GitHub → **Settings → Pages**, set source to **GitHub Actions**
3. In **Settings → Secrets and variables → Actions → Variables**, add:
   - `VITE_API_BASE` = your worker URL (e.g. `https://einthusan-tv-api.your-name.workers.dev/api`)
4. Push to `main` — the workflow builds and deploys automatically

Your site will be live at:

`https://karlogin.github.io/Enithusan-TV-Web/`

## Environment variables

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE` | Worker API base URL (required for production) |
| `VITE_BASE_PATH` | GitHub Pages base path (auto-set in CI) |

Copy `.env.example` to `.env.local` for local overrides:

```bash
cp .env.example .env.local
```

## API endpoints (Worker)

| Endpoint | Description |
|----------|-------------|
| `GET /api/home?lang=tamil` | Home page catalog + featured rows |
| `GET /api/search?q=kara&lang=tamil` | Search movies |
| `GET /api/movie/:id?lang=tamil` | Movie details + HLS stream URL |
| `GET /api/stream?url=...` | Proxied HLS manifest/segments |

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
