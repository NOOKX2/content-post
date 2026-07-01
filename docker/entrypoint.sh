#!/bin/sh
set -e

echo "==> Generating Prisma Client..."
bunx prisma generate

echo "==> Running migrations..."
bunx prisma migrate deploy

echo "==> Seeding database..."
bun run db:seed || true

case "$1" in
  dev)
    echo "==> Clearing stale Next.js cache..."
    rm -rf /app/.next
    echo "==> Starting Next.js dev server (hot reload)..."
    echo "==> Open in browser: http://localhost:3001"
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
