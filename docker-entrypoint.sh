#!/bin/sh
set -e

echo "Applying database migrations..."
npx prisma migrate deploy

echo "Starting Classic Car Rentals Malaysia server..."
exec node src/server.js
