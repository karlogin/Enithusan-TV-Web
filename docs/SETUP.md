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

Already set via `wrangler`:

| Name | Purpose |
|------|---------|
| `AUTH_SECRET` | Reserved for future signed tokens |
| `DEV_SHOW_RESET_LINK` | `true` until email works — shows reset link on forgot-password page |
| `APP_URL` | `https://einthusan.mainframe.website` (in `wrangler.toml`) |
| `MAIL_FROM` | `noreply@mainframe.website` (in `wrangler.toml`) |

After email works, disable dev links:

```bash
cd worker && echo false | npx wrangler secret put DEV_SHOW_RESET_LINK
```

---

## 3. Password reset email (Cloudflare Email Sending)

MailChannels free tier for Workers ended in 2024. This project uses **Cloudflare Email Service**.

### Steps (≈5 minutes)

1. Open [Email Sending](https://dash.cloudflare.com/86d1fcd3848963e4e830d89aec3e1354/email/routing) → **Email Sending**
2. Click **Onboard Domain** → choose **`mainframe.website`**
3. Click **Add records and onboard** (creates `cf-bounce.*` SPF/DKIM/DMARC)
4. Wait until all records show **Locked** (usually 5–15 min)
5. Redeploy worker: `cd worker && npx wrangler deploy`

Test: register an account → **Forgot password** → check inbox for email from `noreply@mainframe.website`.

Until onboarding completes, forgot-password still works via the **dev reset link** shown on the page.

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
