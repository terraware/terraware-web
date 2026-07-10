#!/usr/bin/env bash
set -euo pipefail

.buildkite/scripts/install-deps.sh --node --tools

# DEBUG
docker image ls
docker container ls
docker buildx du


echo "--- :yarn: Install dependencies"
yarn install --frozen-lockfile --prefer-offline

echo "--- :yarn: Generate strings"
yarn generate-strings

echo "--- :prettier: Check formatting"
yarn prettier --check .

echo "--- :eslint: Run linter"
yarn lint \
    --rule 'react/jsx-no-bind: 0' \
    --rule 'react-hooks/immutability: 0' \
    --rule 'react-hooks/refs: 0' \
    --rule 'react-hooks/set-state-in-effect: 0' \
    --rule 'react-hooks/static-components: 0'

echo "--- :typescript: TypeScript check"
yarn ts

echo "--- :jest: Run unit tests"
yarn test:ci

echo "--- :package: Build"
echo "$APP_VERSION" > public/build-version.txt

MIXPANEL_TOKEN_VAR="MIXPANEL_${TIER}_TOKEN"

PUBLIC_TERRAWARE_API='' \
PUBLIC_TERRAWARE_TIER="$LOWER_TIER" \
PUBLIC_TERRAWARE_FE_BUILD_VERSION="$APP_VERSION" \
PUBLIC_DATADOG_APP_ID="${DATADOG_APP_ID:-}" \
PUBLIC_DATADOG_CLIENT_TOKEN="${DATADOG_CLIENT_TOKEN:-}" \
PUBLIC_MIXPANEL_TOKEN="${!MIXPANEL_TOKEN_VAR:-}" \
yarn build
