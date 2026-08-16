#!/usr/bin/env bash
set -e

echo "=== VPS deploy script (AptRent monorepo) ==="
APP_DIR="${APP_DIR:-/var/www/vent-project}"
API_PORT="${API_PORT:-5000}"
WEB_PORT="${WEB_PORT:-3000}"
ADMIN_PORT="${ADMIN_PORT:-3001}"
PUBLIC_API_URL="${PUBLIC_API_URL:-http://${VPS_HOST:-localhost}:5000/api}"

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

echo "Building all apps..."
npm run build

echo "Bootstrapping PostgreSQL (idempotent)..."
"$APP_DIR/database/bootstrap_vps.sh"

echo "Preparing environment files if missing..."
if [ ! -f "$APP_DIR/apps/api/.env" ]; then
  cp "$APP_DIR/apps/api/.env.example" "$APP_DIR/apps/api/.env"
  echo "WARNING: API .env created from template - update JWT_SECRET and CRYPTO_KEY!"
fi
echo "NEXT_PUBLIC_API_URL=$PUBLIC_API_URL" > "$APP_DIR/apps/web/.env.local"
echo "NEXT_PUBLIC_API_URL=$PUBLIC_API_URL" > "$APP_DIR/apps/admin/.env.local"

echo "Restarting apps with PM2..."

restart_or_start() {
  local name="$1" script="$2" cwd="$3" port="$4"
  if pm2 describe "$name" >/dev/null 2>&1; then
    pm2 restart "$name" --update-env
  else
    pm2 start "$script" --name "$name" --cwd "$cwd" -- start -p "$port"
  fi
}

restart_or_start aptrent-api "$APP_DIR/apps/api/dist/main.js" "$APP_DIR/apps/api" "$API_PORT"
restart_or_start aptrent-web "$APP_DIR/node_modules/.bin/next" "$APP_DIR/apps/web" "$WEB_PORT"
restart_or_start aptrent-admin "$APP_DIR/node_modules/.bin/next" "$APP_DIR/apps/admin" "$ADMIN_PORT"
pm2 save

echo "=== Deploy complete ==="
