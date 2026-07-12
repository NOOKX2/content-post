#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:3001}"
API_KEY="${N8N_API_KEY:-dev-n8n-api-key-change-in-production}"
USER_EMAIL="${CREATOR_EMAIL:-creator@idea.local}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

post_fixture() {
  local file="$1"
  echo "→ POST $(basename "$file")"
  curl -sS -X POST "${BASE_URL}/api/content" \
    -H "Content-Type: application/json" \
    -H "x-api-key: ${API_KEY}" \
    -H "x-user-email: ${USER_EMAIL}" \
    -d @"${file}" | jq .
  echo
}

if [[ $# -gt 0 ]]; then
  for file in "$@"; do
    post_fixture "$file"
  done
else
  post_fixture "${SCRIPT_DIR}/video-nook-th.json"
  post_fixture "${SCRIPT_DIR}/image-idea-content-post.json"
  post_fixture "${SCRIPT_DIR}/video-nook-down.json"
fi
