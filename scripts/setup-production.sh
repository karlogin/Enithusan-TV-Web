#!/usr/bin/env bash
# Production setup for Einthusan TV Web
# Usage: ./scripts/setup-production.sh
# Optional: CLOUDFLARE_API_TOKEN=... ./scripts/setup-production.sh

set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ACCOUNT_ID="${CLOUDFLARE_ACCOUNT_ID:-86d1fcd3848963e4e830d89aec3e1354}"
DOMAIN="mainframe.website"
SITE_HOST="einthusan.mainframe.website"
REPO="karlogin/Enithusan-TV-Web"
MAIL_FROM="noreply@${DOMAIN}"

red() { printf '\033[0;31m%s\033[0m\n' "$*"; }
green() { printf '\033[0;32m%s\033[0m\n' "$*"; }
yellow() { printf '\033[1;33m%s\033[0m\n' "$*"; }

cf_api() {
  if [[ -z "${CLOUDFLARE_API_TOKEN:-}" ]]; then
    return 1
  fi
  curl -sf "$@" -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" -H "Content-Type: application/json"
}

section() { echo; echo "=== $* ==="; }

section "1. HTTPS & custom domain"
if gh api "repos/${REPO}/pages" 2>/dev/null | grep -q '"https_enforced":true'; then
  green "✓ GitHub Pages HTTPS enforced for ${SITE_HOST}"
else
  yellow "! Enable HTTPS: GitHub → Settings → Pages → Enforce HTTPS"
fi
if curl -sfI "https://${SITE_HOST}" >/dev/null 2>&1; then
  green "✓ https://${SITE_HOST} responds"
else
  red "✗ https://${SITE_HOST} not reachable"
fi

section "2. Worker secrets"
cd "${ROOT}/worker"
AUTH_SECRET="${AUTH_SECRET:-$(openssl rand -base64 32)}"
echo "${AUTH_SECRET}" | npx wrangler secret put AUTH_SECRET
green "✓ AUTH_SECRET set (save a copy if this is a new deploy)"
echo "true" | npx wrangler secret put DEV_SHOW_RESET_LINK 2>/dev/null || true
yellow "  DEV_SHOW_RESET_LINK=true — shows reset link in UI when email fails (disable after email works)"
green "✓ APP_URL and MAIL_FROM are in wrangler.toml [vars]"

section "3. Cloudflare Email Sending (password reset)"
yellow "Onboard ${DOMAIN} for outbound email (one-time, ~2 min):"
echo "  https://dash.cloudflare.com/${ACCOUNT_ID}/email/routing"
echo "  → Email Sending → Onboard Domain → ${DOMAIN} → Add records"
echo "  Sender address: ${MAIL_FROM}"
if cf_api "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" >/dev/null 2>&1; then
  ZONE_ID=$(cf_api "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result'][0]['id'] if r.get('result') else '')")
  if [[ -n "${ZONE_ID}" ]]; then
    green "✓ Zone ${DOMAIN} found (${ZONE_ID})"
  fi
else
  yellow "  Set CLOUDFLARE_API_TOKEN to automate zone lookup"
fi

section "4. Cloudflare Web Analytics"
BEACON_TOKEN=""
if [[ -n "${CLOUDFLARE_API_TOKEN:-}" ]]; then
  LIST=$(cf_api "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/rum/site_info/list" || echo "")
  BEACON_TOKEN=$(echo "${LIST}" | python3 -c "
import sys, json
try:
  data = json.load(sys.stdin)
  for site in data.get('result', []):
    for rule in site.get('rules', []):
      if rule.get('host') == '${SITE_HOST}':
        import re
        m = re.search(r'\"token\": \"([^\"]+)\"', site.get('snippet',''))
        print(m.group(1) if m else site.get('site_token',''))
        break
except: pass
" 2>/dev/null || true)
  if [[ -z "${BEACON_TOKEN}" ]]; then
    ZONE_ID=$(cf_api "https://api.cloudflare.com/client/v4/zones?name=${DOMAIN}" | python3 -c "import sys,json; r=json.load(sys.stdin); print(r['result'][0]['id'] if r.get('result') else '')" 2>/dev/null || true)
    CREATE=$(cf_api -X POST "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT_ID}/rum/site_info" \
      -d "{\"host\":\"${SITE_HOST}\",\"zone_tag\":\"${ZONE_ID}\",\"auto_install\":false}" 2>/dev/null || echo "")
    BEACON_TOKEN=$(echo "${CREATE}" | python3 -c "
import sys, json, re
try:
  d = json.load(sys.stdin)
  s = d.get('result', {}).get('snippet', '')
  m = re.search(r'\"token\": \"([^\"]+)\"', s)
  print(m.group(1) if m else d.get('result', {}).get('site_token', ''))
except: pass
" 2>/dev/null || true)
  fi
fi

if [[ -n "${BEACON_TOKEN}" ]]; then
  gh variable set VITE_CF_BEACON_TOKEN --body "${BEACON_TOKEN}" -R "${REPO}"
  green "✓ VITE_CF_BEACON_TOKEN set on GitHub (triggers rebuild on next push)"
else
  yellow "Create Web Analytics manually:"
  echo "  https://dash.cloudflare.com/${ACCOUNT_ID}/web-analytics"
  echo "  → Add site → ${SITE_HOST} → copy token"
  echo "  gh variable set VITE_CF_BEACON_TOKEN --body YOUR_TOKEN -R ${REPO}"
fi

section "5. Deploy worker"
npx wrangler deploy
green "✓ Worker deployed"

section "6. Redeploy frontend"
cd "${ROOT}"
if [[ -n "${BEACON_TOKEN:-}" ]]; then
  git commit --allow-empty -m "chore: trigger Pages redeploy after production setup" 2>/dev/null && git push origin main || yellow "Push manually to redeploy Pages"
else
  yellow "Push any commit to redeploy Pages after setting VITE_CF_BEACON_TOKEN"
fi

section "Done"
echo "Site:    https://${SITE_HOST}"
echo "API:     https://einthusan-tv-api.einthusan-karthik.workers.dev"
echo "Analytics: https://dash.cloudflare.com/${ACCOUNT_ID}/web-analytics"
echo
yellow "After email domain is onboarded, disable dev reset links:"
echo "  cd worker && echo false | npx wrangler secret put DEV_SHOW_RESET_LINK"
