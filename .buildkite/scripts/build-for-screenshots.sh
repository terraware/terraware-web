#!/usr/bin/env bash
# Lightweight build step for the screenshot regression pipeline.
# Skips linting, type checking, and unit tests — just installs deps and builds
# the production bundle so the screenshot check step can serve it.
set -euo pipefail

.buildkite/scripts/install-deps.sh --node --tools

echo "--- :yarn: Install dependencies"
yarn install --frozen-lockfile --prefer-offline

echo "--- :package: Build production bundle"
APP_VERSION=$(git rev-parse --short HEAD)
echo "$APP_VERSION" > public/build-version.txt

PUBLIC_TERRAWARE_API='' \
PUBLIC_TERRAWARE_TIER="${LOWER_TIER:-staging}" \
PUBLIC_TERRAWARE_FE_BUILD_VERSION="$APP_VERSION" \
PUBLIC_DATADOG_APP_ID="${DATADOG_APP_ID:-}" \
PUBLIC_DATADOG_CLIENT_TOKEN="${DATADOG_CLIENT_TOKEN:-}" \
PUBLIC_MIXPANEL_TOKEN="${MIXPANEL_TOKEN:-}" \
yarn build
