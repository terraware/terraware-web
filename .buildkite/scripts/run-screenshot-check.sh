#!/usr/bin/env bash
# Run screenshot regression tests and exit with the Playwright exit code.
# A non-zero exit marks the Buildkite step as failed, which triggers the
# email notification configured on the pipeline.
set -euo pipefail

.buildkite/scripts/install-deps.sh --node

echo "--- :yarn: Install dependencies"
yarn install --frozen-lockfile --prefer-offline

echo "--- :docker: Clean up any leftover containers from previous runs"
docker compose --profile prod down --remove-orphans 2>/dev/null || true
# Release port 5432 if held by any container (e.g. a leftover from another pipeline on this host)
docker ps --format '{{.ID}}' --filter 'publish=5432' | xargs -r docker stop 2>/dev/null || true

echo "--- :docker: Download and start backend"
yarn server:reset

PLAYWRIGHT_VERSION=$(node -e "console.log(require('./node_modules/@playwright/test/package.json').version)")
PLAYWRIGHT_IMAGE="mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"

echo "--- :playwright: Pull Playwright Docker image v${PLAYWRIGHT_VERSION}"
docker pull "$PLAYWRIGHT_IMAGE"

DOCKER_BASE=(
  docker run --rm --ipc=host --network=host
  -v "$(pwd):/work" -w /work
  -e CI=true
  -e NODE_OPTIONS=--max-old-space-size=16384
  "$PLAYWRIGHT_IMAGE"
)

echo "--- :camera_with_flash: Run screenshot regression tests"
"${DOCKER_BASE[@]}" \
  sh -c "node_modules/.bin/wait-on -t 60000 http://localhost:3001 \
         && node_modules/.bin/playwright test playwright/e2e/suites/screenshots --project=prod"

.buildkite/scripts/upload-playwright-results.sh
