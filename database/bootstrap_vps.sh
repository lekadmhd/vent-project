#!/usr/bin/env bash
# Idempotent PostgreSQL + PostGIS bootstrap for AptRent VPS
set -e

DB_USER="${DB_USER:-aptrent}"
DB_PASSWORD="${DB_PASSWORD:-aptrent_secret}"
DB_NAME="${DB_NAME:-aptrent}"
SCHEMA_FILE="$(cd "$(dirname "$0")" && pwd)/schema.sql"

echo "=== PostgreSQL bootstrap ==="
echo "DB: $DB_NAME, user: $DB_USER"

if ! command -v psql >/dev/null 2>&1; then
  echo "Installing PostgreSQL + PostGIS..."
  sudo apt-get update -y
  DEBIAN_FRONTEND=noninteractive sudo apt-get install -y postgresql postgresql-contrib postgis
fi

echo "Starting PostgreSQL service..."
if command -v systemctl >/dev/null 2>&1; then
  sudo systemctl enable --now postgresql 2>/dev/null || sudo systemctl start postgresql
else
  sudo service postgresql start 2>/dev/null || true
fi

wait_for_pg() {
  for i in $(seq 1 30); do
    if sudo -u postgres pg_isready -q; then
      return 0
    fi
    sleep 1
  done
  echo "ERROR: PostgreSQL not ready"
  return 1
}
wait_for_pg

echo "Ensuring role and database exist..."
sudo -u postgres psql -tAc "SELECT 1 FROM pg_roles WHERE rolname='$DB_USER'" | grep -q 1 || \
  sudo -u postgres psql -c "CREATE ROLE $DB_USER LOGIN PASSWORD '$DB_PASSWORD' CREATEDB;"

sudo -u postgres psql -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" | grep -q 1 || \
  sudo -u postgres createdb -O "$DB_USER" "$DB_NAME"

echo "Enabling PostGIS extension..."
sudo -u postgres psql -d "$DB_NAME" -c "CREATE EXTENSION IF NOT EXISTS postgis;"

echo "Applying schema (idempotent)..."
if sudo -u postgres psql -d "$DB_NAME" -tAc "SELECT 1 FROM information_schema.tables WHERE table_name='users'" | grep -q 1; then
  echo "Schema already applied, skipping."
else
  sudo -u postgres psql -d "$DB_NAME" -f "$SCHEMA_FILE"
fi

echo "Granting privileges to app user..."
sudo -u postgres psql -d "$DB_NAME" -c "GRANT USAGE ON SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON ALL TABLES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO $DB_USER;"
sudo -u postgres psql -d "$DB_NAME" -c "ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO $DB_USER;"

echo "=== PostgreSQL bootstrap complete ==="
