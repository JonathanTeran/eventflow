#!/bin/sh
set -e

cd /app

# Limpiar todo cache residual del build
php artisan config:clear 2>/dev/null || true
php artisan route:clear 2>/dev/null || true
php artisan view:clear 2>/dev/null || true

# Validar que APP_KEY exista en .env
if ! grep -q '^APP_KEY=.\+' .env 2>/dev/null; then
    echo "FATAL: APP_KEY is not set in .env. Cannot start." >&2
    exit 1
fi

# Create storage symlink
php artisan storage:link 2>/dev/null || true

# Cache para producción
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Correr migraciones pendientes automáticamente
php artisan migrate --force --no-interaction

# Permisos
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
