#!/usr/bin/env bash
set -euo pipefail

.buildkite/scripts/install-deps.sh --node --playwright

echo "--- :docker: Download and start backend"
yarn server:reset

echo "--- :playwright: Install Playwright browsers"
yarn playwright install --with-deps chromium-headless-shell

echo "--- :playwright: Run end-to-end tests"
# Retry once on timeout, matching the GHA behavior (retry_on: timeout).
timeout 20m yarn test:e2e || {
  if [ $? -eq 124 ]; then
    echo "Test timed out, retrying once..."
    timeout 20m yarn test:e2e
  else
    exit 1
  fi
}
