#!/usr/bin/env bash
set -euo pipefail

.buildkite/scripts/install-deps.sh --node --tools

echo "--- :yarn: Generate types"
yarn generate-types

echo "--- :yarn Generate queries"
PUBLIC_TERRAWARE_API=http://localhost:8080 yarn generate-queries

# TODO add validation of generated output here. For now, running the scripts will validate that a dependency update
# TODO didn't break one of these
