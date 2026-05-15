#!/bin/bash
set -e

export DJANGO_SETTINGS_MODULE=chatproject.settings

echo "==> Running Django migrations..."
python manage.py makemigrations backend --no-input 2>/dev/null || true
python manage.py migrate --no-input

echo "==> Installing frontend dependencies..."
cd frontend && npm install

echo "==> Building frontend for production..."
npm run build
cd ..

echo "==> Collecting static files..."
python manage.py collectstatic --no-input 2>/dev/null || true

echo "==> Starting server on port 8000..."
daphne -b 0.0.0.0 -p 8000 chatproject.asgi:application
