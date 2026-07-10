#!/usr/bin/env bash
set -euo pipefail

.buildkite/scripts/install-deps.sh --node --tools

# generate-types and generate-queries needs the backend's OpenAPI spec at
# localhost:8080. If a server is already running, reuse it; otherwise start
# one (no server:reset needed since we only read the spec, not the seeded data).
if curl -sf http://localhost:8080/swagger-ui/index.html > /dev/null 2>&1; then
  echo "--- :docker: Backend already running at localhost:8080"
else
  echo "--- :docker: Start backend"
  yarn docker:start:prod
  if ! yarn wait-be; then
    docker compose logs terraware-server
    exit 1
  fi
fi

echo "--- :yarn: Generate types"
yarn generate-types

echo "--- :yarn Generate queries"
PUBLIC_TERRAWARE_API=http://localhost:8080 yarn generate-queries

# TODO add validation of generated output here. For now, running the scripts will validate that a dependency update
# TODO didn't break one of these
