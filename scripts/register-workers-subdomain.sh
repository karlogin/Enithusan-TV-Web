#!/usr/bin/env bash
# Register workers.dev subdomain when the Cloudflare onboarding page fails.
# Requires: wrangler login first (npx wrangler login)
set -euo pipefail

SUBDOMAIN="${1:-einthusan-karthik}"
CONFIG="${HOME}/Library/Preferences/.wrangler/config/default.toml"

if [[ ! -f "$CONFIG" ]]; then
  echo "Run 'npx wrangler login' first."
  exit 1
fi

TOKEN=$(grep oauth_token "$CONFIG" | cut -d'"' -f2)
ACCOUNT=$(cd "$(dirname "$0")/../worker" && npx wrangler whoami 2>/dev/null | grep -oE '[a-f0-9]{32}' | tail -1)

if [[ -z "$ACCOUNT" ]]; then
  echo "Could not read Cloudflare account ID. Run from repo root after wrangler login."
  exit 1
fi

echo "Registering workers.dev subdomain: ${SUBDOMAIN}.workers.dev"
curl -sf -X PUT "https://api.cloudflare.com/client/v4/accounts/${ACCOUNT}/workers/subdomain" \
  -H "Authorization: Bearer ${TOKEN}" \
  -H "Content-Type: application/json" \
  -d "{\"subdomain\":\"${SUBDOMAIN}\"}" | python3 -m json.tool

echo "Done. Deploy with: cd worker && npx wrangler deploy"
