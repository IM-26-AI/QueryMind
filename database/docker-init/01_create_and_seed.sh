#!/bin/sh
set -e

echo "Creating demo_data database if it does not exist..."

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname "$POSTGRES_DB" <<-EOSQL
SELECT 'CREATE DATABASE demo_data'
WHERE NOT EXISTS (
  SELECT FROM pg_database WHERE datname = 'demo_data'
)\gexec
EOSQL

echo "Seeding demo_data..."

psql -v ON_ERROR_STOP=1 \
  --username "$POSTGRES_USER" \
  --dbname demo_data \
  -f /docker-entrypoint-initdb.d/02_sample_complex_seed.sql
