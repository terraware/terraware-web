#!/usr/bin/env bash
set -euo pipefail

.buildkite/scripts/install-deps.sh --node

echo "--- :docker: Download and start backend"
yarn server:reset

PLAYWRIGHT_VERSION=$(node -e "console.log(require('./node_modules/@playwright/test/package.json').version)")

echo "--- :playwright: Pull Playwright Docker image v${PLAYWRIGHT_VERSION}"
docker pull "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"

# Run inside the official Playwright Docker image so font rendering matches
# snapshot generation, eliminating cross-distro pixel differences.
# --network=host allows the container to reach the backend running on localhost.
DOCKER_RUN=(
  docker run --rm --ipc=host --network=host
  -v "$(pwd):/work" -w /work
  -e CI=true
  -e NODE_OPTIONS=--max-old-space-size=16384
  "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"
  sh -c "node_modules/.bin/wait-on -t 60000 http://localhost:3001 && node_modules/.bin/playwright test playwright/e2e --project=prod"
)

echo "--- :playwright: Run end-to-end tests"
# Retry once on timeout, matching the GHA behavior (retry_on: timeout).
timeout 20m "${DOCKER_RUN[@]}" || {
  if [ $? -eq 124 ]; then
    echo "Test timed out, retrying once..."
    timeout 20m "${DOCKER_RUN[@]}"
  else
    exit 1
  fi
}
