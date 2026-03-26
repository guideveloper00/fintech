#!/bin/sh
set -e

echo ">>> Running migrations..."
node ./node_modules/typeorm/cli.js migration:run -d dist/database/data-source.js

echo ">>> Running seed..."
node dist/database/seed.js

echo ">>> Starting application..."
exec node dist/main
