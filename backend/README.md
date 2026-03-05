# BuilderApp Backend

Backend API de `BuilderApp`, construido con Laravel.

## Requisitos

- PHP 8.2+ (segun la version configurada en el proyecto)
- Composer
- Base de datos (MySQL/PostgreSQL, segun `.env`)

## Instalacion

```bash
composer install
cp .env.example .env
php artisan key:generate
```

Configura las variables de entorno en `.env` (base de datos, app URL, etc.) y luego ejecuta:

```bash
php artisan migrate
php artisan serve
```

## Documentacion

- Changelog: `docs/CHANGELOG.md`
- Roadmap: `docs/ROADMAP.md`

## Stack

- Laravel
- PHP
- Composer

