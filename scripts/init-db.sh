#!/bin/sh
set -e

echo "Provisioning database and user..."

# Check if role exists, create if not
psql -v ON_ERROR_STOP=1 <<-EOSQL
    DO \$\$
    BEGIN
        IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = '$APP_USER') THEN
            EXECUTE format('CREATE ROLE %I LOGIN PASSWORD %L', '$APP_USER', '$APP_PASSWORD');
            RAISE NOTICE 'Created role %', '$APP_USER';
        ELSE
            RAISE NOTICE 'Role % already exists', '$APP_USER';
        END IF;
    END
    \$\$;
EOSQL

# Check if database exists, create if not
psql -v ON_ERROR_STOP=1 <<-EOSQL
    SELECT 'CREATE DATABASE $APP_DB OWNER $APP_USER'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = '$APP_DB')\gexec
EOSQL

# Grant connect permission
psql -v ON_ERROR_STOP=1 -d "$APP_DB" <<-EOSQL
    GRANT ALL PRIVILEGES ON DATABASE $APP_DB TO $APP_USER;
    GRANT ALL PRIVILEGES ON SCHEMA public TO $APP_USER;
EOSQL

echo "Done."
