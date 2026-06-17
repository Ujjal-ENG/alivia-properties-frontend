#!/usr/bin/env bash
# Frontend redeploy — run this ON THE VM, from /root/alivia-properties-frontend.
# Pulls latest code, installs deps, REBUILDS (NEXT_PUBLIC_* is baked in at build),
# restarts the pm2 process, and health-checks.
set -euo pipefail

cd "$(dirname "$0")"

echo "==> Pulling latest frontend code..."
git pull

echo "==> Installing dependencies..."
pnpm install

echo "==> Building (NEXT_PUBLIC_* values are frozen here)..."
pnpm build

echo "==> Restarting pm2 process..."
pm2 restart alivia-frontend --update-env
pm2 save

echo "==> Health check:"
curl -s -o /dev/null -w "SITE http://localhost:3000 -> %{http_code}\n" http://localhost:3000

echo "==> Done."
