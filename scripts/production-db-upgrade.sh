#!/usr/bin/env bash
# Upgrade Neon production without db push --accept-data-loss.
#
# Prerequisites:
#   - DATABASE_URL in .env points to production (or export it explicitly)
#   - Neon backup / branch created first
#
# What this does:
#   1. Marks migrations 1–7 as already applied (baseline)
#   2. Runs migrate deploy for pending migrations (8–11), including:
#      - CollaborationChannelRead, message edit/delete columns
#      - createdById + CollaborationChannelMember
#      - participantIds → CollaborationChannelMember, then drops legacy columns
#
# Usage:
#   chmod +x scripts/production-db-upgrade.sh
#   ./scripts/production-db-upgrade.sh

set -euo pipefail

cd "$(dirname "$0")/.."

if [[ -z "${DATABASE_URL:-}" ]] && [[ ! -f .env ]]; then
  echo "ERROR: Set DATABASE_URL or create .env with production connection string."
  exit 1
fi

echo "==> Checking migration status..."
bunx prisma migrate status || true

BASELINE=(
  "20260630152515_init"
  "20260701074602_add_content_model"
  "20260701173000_location_as_array"
  "20260710160000_add_posting_channels"
  "20260713220000_add_posting_status"
  "20260714080000_add_prepost_dates"
  "20260717120000_team_collaboration"
)

echo ""
echo "==> Baseline: mark migrations 1–7 as applied (schema already on production)..."
for name in "${BASELINE[@]}"; do
  echo "    resolve --applied $name"
  bunx prisma migrate resolve --applied "$name"
done

echo ""
echo "==> Deploy pending migrations (8–11)..."
bunx prisma migrate deploy

echo ""
echo "==> Final status:"
bunx prisma migrate status

echo ""
echo "Done. Test https://idea-content.vercel.app/create"
