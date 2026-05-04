#!/usr/bin/env bash
# Run screenshot regression tests and exit with the Playwright exit code.
# A non-zero exit marks the Buildkite step as failed, which triggers the
# email notification configured on the pipeline.
set -euo pipefail

.buildkite/scripts/install-deps.sh --node

echo "--- :docker: Download and start backend"
yarn server:reset

PLAYWRIGHT_VERSION=$(node -e "console.log(require('./node_modules/@playwright/test/package.json').version)")

echo "--- :playwright: Pull Playwright Docker image v${PLAYWRIGHT_VERSION}"
docker pull "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"

DOCKER_BASE=(
  docker run --rm --ipc=host --network=host
  -v "$(pwd):/work" -w /work
  -e CI=true
  -e NODE_OPTIONS=--max-old-space-size=16384
  "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"
)

echo "--- :camera_with_flash: Run screenshot regression tests"
"${DOCKER_BASE[@]}" \
  sh -c "node_modules/.bin/wait-on -t 60000 http://localhost:3001 \
         && node_modules/.bin/playwright test playwright/e2e/suites/screenshots --project=prod"
