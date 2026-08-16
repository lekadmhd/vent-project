#!/usr/bin/env bash
set -e

echo "=== VPS deploy script ==="
echo "App dir: $APP_DIR"

if [ -z "$APP_DIR" ]; then
  APP_DIR="/var/www/vent-project"
fi

echo "Deploying to $APP_DIR"

if [ ! -d "$APP_DIR/.git" ]; then
  echo "Cloning repository for the first time..."
  if [ -z "$REPO_URL" ]; then
    echo "ERROR: REPO_URL not set (e.g. git@github.com:user/repo.git)"
    exit 1
  fi
  git clone "$REPO_URL" "$APP_DIR"
  cd "$APP_DIR"
else
  echo "Pulling latest code..."
  cd "$APP_DIR"
  git pull origin main
fi

echo "Installing dependencies..."
npm ci --omit=dev || npm install

echo "Restarting app with PM2..."
pm2 restart vent-project 2>/dev/null || pm2 start server.js --name vent-project
pm2 save

echo "=== Deploy complete ==="
