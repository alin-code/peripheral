#!/bin/bash
set -Eeuo pipefail

COZE_WORKSPACE_PATH="${COZE_WORKSPACE_PATH:-$(pwd)}"

cd "${COZE_WORKSPACE_PATH}"

if [[ ! -d node_modules ]]; then
  echo "node_modules not found, installing full dependency set..."
  pnpm install --frozen-lockfile --prod=false --reporter=append-only
else
  echo "Using existing dependencies in node_modules."
fi

echo "Building the Next.js project..."
pnpm next build

echo "Bundling server with tsup..."
pnpm tsup src/server.ts --format cjs --platform node --target node20 --outDir dist --no-splitting --no-minify

echo "Build completed successfully!"
