#!/bin/sh
set -e

echo "==> Syncing dependencies..."
bun install

echo "==> Generating Prisma Client..."
bun run db:generate

echo "==> Running migrations..."
bun run db:deploy

echo "==> Seeding database..."
bun run db:seed || true

case "$1" in
  dev)
    echo "==> Clearing stale Next.js cache..."
    rm -rf /app/.next
    echo "==> Starting Next.js dev server (hot reload)..."
    echo "==> Open in browser: http://localhost:3000"
    echo "==> n8n workflow automation: http://localhost:5678"
    exec bun run dev:docker
    ;;
  studio)
    echo "==> Starting Prisma Studio..."
    exec bun run studio:docker
    ;;
  *)
    exec "$@"
    ;;
esac
