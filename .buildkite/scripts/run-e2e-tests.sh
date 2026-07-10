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
DOCKER_BASE=(
  docker run --rm --ipc=host --network=host
  -v "$(pwd):/work" -w /work
  -e CI=true
  -e NODE_OPTIONS=--max-old-space-size=16384
  "mcr.microsoft.com/playwright:v${PLAYWRIGHT_VERSION}-jammy"
)

run_tests() {
  local label="$1"
  local test_path="$2"
  local docker_cmd=(
    "${DOCKER_BASE[@]}"
    sh -c "node_modules/.bin/wait-on -t 60000 http://localhost:3001 && node_modules/.bin/playwright test ${test_path} --project=prod"
  )

  echo "--- :playwright: ${label}"
  # Retry once on timeout.
  timeout 20m "${docker_cmd[@]}" || {
    if [ $? -eq 124 ]; then
      echo "Tests timed out, retrying once..."
      timeout 20m "${docker_cmd[@]}"
    else
      exit 1
    fi
  }
}

# Run screenshot tests first so they see a clean DB state before other tests
# mutate server data (e.g. reportSubmit creates a report config that enables
# the Reports nav item, which would change the snapshot baseline).

# TODO uncomment this once screenshot tests are stable
# AllPagesScreenshots is excluded here — it runs only in the dedicated weekly
# screenshot-check pipeline (.buildkite/pipeline.screenshot-check.yml).
#run_tests "Run screenshot tests" "playwright/e2e/suites/screenshots --grep-invert AllPagesScreenshots"


# The shell inside Docker expands the glob to all spec files directly in the
# suites directory, excluding the screenshots subdirectory.
run_tests "Run remaining end-to-end tests" "playwright/e2e/suites/*.spec.ts"

.buildkite/scripts/upload-playwright-results.sh
