#!/bin/bash
set -e

echo "==> Starting BLINK Production Entrypoint"

# 1. Wait for Database to be ready
if [ -n "$DATABASE_URL" ]; then
    echo "Waiting for database to be reachable..."
    
    # Simple retry loop
    MAX_RETRIES=30
    COUNT=0
    until psql "$DATABASE_URL" -c '\q' > /dev/null 2>&1 || [ $COUNT -eq $MAX_RETRIES ]; do
        echo "Database not ready yet... (Attempt $((COUNT+1))/$MAX_RETRIES)"
        sleep 2
        COUNT=$((COUNT+1))
    done

    if [ $COUNT -eq $MAX_RETRIES ]; then
        echo "Timeout waiting for database. Proceeding anyway..."
    else
        echo "Database is reachable."
        
        # Strip \c blink from init.sql to make it compatible with Render's DB name
        grep -v "\\c blink" /app/database/init.sql > /tmp/init_clean.sql
        
        echo "Running database migrations..."
        psql "$DATABASE_URL" -f /tmp/init_clean.sql || echo "Database migration failed or already exists (non-fatal)"
    fi
fi

# 2. Ensure logs and algos directories exist
mkdir -p /app/logs /app/algos

# 3. Hand off to Supervisord
echo "Starting Supervisord..."
exec /usr/bin/supervisord -c /etc/supervisor/supervisord.conf
