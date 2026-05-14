#!/bin/bash
set -e

echo "==> Starting BLINK Production Entrypoint"

# 1. Wait for Database to be ready
if [ -n "$DATABASE_URL" ]; then
    echo "Checking database connection..."
    # Extract host and port from DATABASE_URL for pg_isready if needed, 
    # but psql is simpler for a one-off init.
    
    # Strip \c blink from init.sql to make it compatible with Render's DB name
    grep -v "\\c blink" /app/database/init.sql > /tmp/init_clean.sql
    
    echo "Running database migrations..."
    psql "$DATABASE_URL" -f /tmp/init_clean.sql || echo "Database already initialized or migration failed (non-fatal)"
fi

# 2. Ensure logs and algos directories exist
mkdir -p /app/logs /app/algos

# 3. Hand off to Supervisord
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
