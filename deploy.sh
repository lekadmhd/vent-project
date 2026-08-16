#!/usr/bin/env bash
set -e

echo "=== VPS deploy script (AptRent monorepo) ==="
APP_DIR="${APP_DIR:-/var/www/vent-project}"

echo "App dir: $APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository for the first time..."
  if [ -z "$REPO_URL" ]; then
    echo "ERROR: REPO_URL not set (e.g. git@github.com:user/repo.git)"
    exit 1
  fi
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
echo "Pulling latest code..."
git pull origin main

echo "Installing dependencies (workspaces)..."
npm ci || npm install

echo "Building API..."
npm run build

echo "Preparing environment file if missing..."
if [ ! -f "$APP_DIR/apps/api/.env" ]; then
  cp "$APP_DIR/apps/api/.env.example" "$APP_DIR/apps/api/.env"
  echo "WARNING: .env created from template - update JWT_SECRET and CRYPTO_KEY!"
fi

echo "Restarting app with PM2..."
if pm2 describe aptrent-api >/dev/null 2>&1; then
  pm2 restart aptrent-api --update-env
else
  pm2 start "$APP_DIR/apps/api/dist/main.js" --name aptrent-api --cwd "$APP_DIR/apps/api"
fi
pm2 save

echo "=== Deploy complete ==="
