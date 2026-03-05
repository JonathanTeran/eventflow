#!/bin/sh
set -e

cd /app

# Create storage symlink if not exists
php artisan storage:link 2>/dev/null || true

# Cache configuration for production performance
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ensure correct permissions
chown -R www-data:www-data storage bootstrap/cache

exec "$@"
