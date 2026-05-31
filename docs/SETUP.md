# Production setup guide

One-time checklist for HTTPS, password-reset email, analytics, and worker secrets.

## Quick setup script

```bash
# Optional: create a Cloudflare API token with Zone:Read + Account Analytics:Edit
export CLOUDFLARE_API_TOKEN=your_token
./scripts/setup-production.sh
```

---

## 1. HTTPS (custom domain)

**Status:** Already configured.

| Check | Value |
|-------|-------|
| Domain | `einthusan.mainframe.website` |
| CNAME | → `karlogin.github.io` |
| Certificate | GitHub Pages (approved) |
| Enforce HTTPS | On |

Verify: [https://einthusan.mainframe.website](https://einthusan.mainframe.website)

---

## 2. Worker secrets & vars

| Name | Purpose |
|------|---------|
| `AUTH_SECRET` | Reserved for future signed tokens |
| `APP_URL` | `https://einthusan.mainframe.website` (in `wrangler.toml`) |
| `RESEND_API_KEY` | *(optional)* Send reset emails via [Resend](https://resend.com) free tier |

---

## 3. Password reset (free — no paid email required)

Cloudflare Email Sending is paid. By default, **forgot password shows a reset link on the page** (valid 1 hour). No email setup needed.

### Optional: email via Resend (free tier)

1. Sign up at [resend.com](https://resend.com) and create an API key
2. Verify `mainframe.website` (or use `onboarding@resend.dev` for testing)
3. Set worker secrets:

```bash
cd worker
echo "YOUR_RESEND_KEY" | npx wrangler secret put RESEND_API_KEY
echo "Einthusan TV <noreply@mainframe.website>" | npx wrangler secret put MAIL_FROM
npx wrangler deploy
```

When `RESEND_API_KEY` is set, reset links are emailed instead of shown in the UI.

---

## 4. Cloudflare Web Analytics

### Option A — Dashboard

1. Open [Web Analytics](https://dash.cloudflare.com/86d1fcd3848963e4e830d89aec3e1354/web-analytics)
2. **Add a site** → hostname `einthusan.mainframe.website`
3. Copy the **beacon token** from the snippet
4. Set GitHub variable and redeploy:

```bash
gh variable set VITE_CF_BEACON_TOKEN --body YOUR_BEACON_TOKEN -R karlogin/Enithusan-TV-Web
git commit --allow-empty -m "chore: redeploy with analytics" && git push
```

### Option B — API (with token)

```bash
export CLOUDFLARE_API_TOKEN=...
./scripts/setup-production.sh
```

The build injects the beacon into `index.html` when `VITE_CF_BEACON_TOKEN` is set.

---

## 5. GitHub repository variables

| Variable | Value |
|----------|-------|
| `VITE_API_BASE` | `https://einthusan-tv-api.einthusan-karthik.workers.dev/api` ✓ |
| `VITE_CF_BEACON_TOKEN` | `7cfc13c21a214d209daca8a89eceb1ac` ✓ |

## 6. GitHub Actions (worker CI deploy)

Secrets configured for automatic worker deploy on push to `worker/`:

| Secret | Purpose |
|--------|---------|
| `CLOUDFLARE_API_TOKEN` | Account API token (Workers Scripts + KV write) |
| `CLOUDFLARE_ACCOUNT_ID` | `86d1fcd3848963e4e830d89aec3e1354` |

Workflow: `.github/workflows/deploy-worker.yml` (uses `cloudflare/wrangler-action@v3`).

---

## Not included (optional infra)

These were suggested earlier but are **not required** for current playback:

| Item | Why skipped |
|------|-------------|
| Cloudflare Pages for frontend | GitHub Pages + custom domain works |
| D1 database | KV is sufficient for auth/library |
| Fly.io HLS proxy | Direct MP4 from CDN works in browser |

---

## Verify everything

```bash
# HTTPS
curl -sI https://einthusan.mainframe.website | head -3

# API + UHD stream
curl -s "https://einthusan-tv-api.einthusan-karthik.workers.dev/api/movie/57T9/stream?lang=tamil" | jq .

# Worker secrets
cd worker && npx wrangler secret list
```
