#!/usr/bin/env bash
set -euo pipefail

PLAYWRIGHT_VERSION=$(node -e "console.log(require('./node_modules/@playwright/test/package.json').version)")

echo "Using Playwright v${PLAYWRIGHT_VERSION}"

docker run --rm --ipc=host --platform linux/amd64 \
  -v "$(pwd):/work" -w /work \
  -e PLAYWRIGHT_BASE_URL=http://host.docker.internal:3001 \
  -e TIMEOUT=60000 \
  -e WORKERS=1 \
  "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy" \
  npx playwright test e2e/suites/screenshots --project=prod --update-snapshots
