#!/usr/bin/env sh
set -e

cd /var/www/html

# Force production assets from public/build instead of local Vite dev server.
rm -f public/hot

if [ -z "$APP_KEY" ]; then
  export APP_KEY="base64:$(php -r 'echo base64_encode(random_bytes(32));')"
fi

mkdir -p bootstrap/cache
mkdir -p storage/framework/cache/data
mkdir -p storage/framework/sessions
mkdir -p storage/framework/views
mkdir -p storage/logs
chmod -R 777 storage bootstrap/cache || true

if [ -n "$DB_DATABASE" ]; then
  mkdir -p "$(dirname "$DB_DATABASE")"
  if [ ! -f "$DB_DATABASE" ]; then
    touch "$DB_DATABASE"
  fi
fi

php artisan config:clear || true
php artisan cache:clear || true
php artisan view:clear || true
php artisan migrate --force
php artisan storage:link || true
php artisan optimize || true

php artisan serve --host=0.0.0.0 --port="${PORT:-10000}"
