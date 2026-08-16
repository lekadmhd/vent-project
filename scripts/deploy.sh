#!/usr/bin/env bash
# Shortcut: commit semua perubahan & push ke main (auto-deploy ke VPS via GitHub Actions).
# Usage:
#   ./scripts/deploy.sh "pesan commit"        -> commit + push + cek status deploy
#   ./scripts/deploy.sh                       -> pakai pesan default
set -euo pipefail

cd "$(git rev-parse --show-toplevel)"

MSG="${1:-deploy: update $USER $(date '+%H:%M')}"

echo "==> git add -A"
git add -A

if [ -z "$(git diff --cached --stat)" ]; then
  echo "Tidak ada perubahan untuk di-deploy."
  exit 0
fi

echo "==> commit: $MSG"
git commit -m "$MSG"

echo "==> push origin main"
git push origin main

echo "==> memantau status deploy..."
if command -v gh >/dev/null 2>&1; then
  sleep 5
  gh run watch "$(gh run list --limit 1 --json databaseId --jq '.[0].databaseId')" --interval 20 || true
  gh run list --limit 1
else
  echo "gh tidak terpasang — cek status di https://github.com/lekadmhd/vent-project/actions"
fi
