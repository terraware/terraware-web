#!/usr/bin/env bash
set -euo pipefail

.buildkite/scripts/install-deps.sh --node --playwright

echo "--- :docker: Download and start backend"
yarn server:reset

echo "--- :playwright: Install Playwright browsers"
yarn playwright install --with-deps chromium-headless-shell

echo "--- :playwright: Run end-to-end tests"
# Retry once on timeout, matching the GHA behavior.
yarn test:e2e || yarn test:e2e
