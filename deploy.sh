#!/usr/bin/env bash
set -e

echo "=== VPS deploy script (AptRent monorepo) ==="
APP_DIR="${APP_DIR:-/var/www/vent-project}"
API_PORT="${API_PORT:-5000}"
WEB_PORT="${WEB_PORT:-3000}"
ADMIN_PORT="${ADMIN_PORT:-3001}"
PUBLIC_API_URL="${PUBLIC_API_URL:-http://${VPS_HOST:-localhost}:5000/api}"

echo "App dir: $APP_DIR"

# Ensure swap exists to avoid OOM kills during npm install on low-RAM VPS
ensure_swap() {
  local need_mb="${SWAP_GB:-4}"
  local existing
  existing=$(free -m | awk '/Swap:/{print $2}')
  if [ "$existing" -lt 1024 ]; then
    echo "Adding ${need_mb}GB swapfile (current swap: ${existing}MB)..."
    local i=0
    while [ -e "/swapfile$i" ] && grep -qs "/swapfile$i" /proc/swaps; do i=$((i+1)); done
    local path="/swapfile$i"
    if [ "$i" -eq 0 ] && [ -e "$path" ]; then path="/swapfile-$RANDOM"; fi
    fallocate -l "${need_mb}G" "$path" 2>/dev/null || dd if=/dev/zero of="$path" bs=1M count=$((need_mb*1024)) status=none
    chmod 600 "$path"
    mkswap "$path" >/dev/null
    swapon "$path"
    echo "$path none swap sw 0 0" >> /etc/fstab
    sysctl -w vm.swappiness=10 >/dev/null
  fi
  echo "Swap: $(free -h | awk '/Swap:/{print $2}')"
}
ensure_swap

# Bound build memory on low-RAM hosts
export NODE_OPTIONS="${NODE_OPTIONS:-} --max-old-space-size=1024"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository for the first time..."
  if [ -z "$REPO_URL" ]; then
    echo "ERROR: REPO_URL not set (e.g. git@github.com:user/repo.git)"
    exit 1
  fi
  git clone "$REPO_URL" "$APP_DIR"
fi

cd "$APP_DIR"
echo "Pulling latest code (hard reset)..."
git fetch origin
git reset --hard origin/main
git clean -fd

echo "Installing dependencies (workspaces)..."
rm -rf node_modules
npm ci --no-audit --no-fund || npm install --no-audit --no-fund

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
pm2 delete vent-project 2>/dev/null || true

restart_or_start() {
  local name="$1" script="$2" cwd="$3" port="$4"
  pm2 delete "$name" 2>/dev/null || true
  pm2 start "$script" --name "$name" --cwd "$cwd" --max-memory-restart 300M -- start -p "$port"
}

restart_or_start aptrent-api "$APP_DIR/apps/api/dist/main.js" "$APP_DIR/apps/api" "$API_PORT"
restart_or_start aptrent-web "$APP_DIR/node_modules/.bin/next" "$APP_DIR/apps/web" "$WEB_PORT"
restart_or_start aptrent-admin "$APP_DIR/node_modules/.bin/next" "$APP_DIR/apps/admin" "$ADMIN_PORT"
pm2 save

echo "=== Deploy complete ==="
