#!/bin/bash
#
# Deploy a preview to Vercel for pull request builds.
# Replaces vercel.yml from GHA.

set -euo pipefail

.buildkite/scripts/install-deps.sh --node --tools

echo "--- :vercel: Configure Vercel project"
mkdir -p .vercel
echo "{\"projectId\":\"${VERCEL_PROJECT_ID}\",\"orgId\":\"${VERCEL_ORG_ID}\"}" > .vercel/project.json

echo "--- :vercel: Pull Vercel project settings"
npx vercel pull --yes --environment=preview --token="$VERCEL_TOKEN"

echo "--- :vercel: Build project"
npx vercel build --token="$VERCEL_TOKEN"

echo "--- :vercel: Deploy to Vercel"
preview_url=$(npx vercel deploy --prebuilt --archive=tgz --token="$VERCEL_TOKEN" --meta branch="$BUILDKITE_BRANCH")

echo "Preview deployed to: ${preview_url}"

echo "--- :vercel: Alias deployment to branch URL"
branch_slug=$(echo "$BUILDKITE_BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')
branch_url="terraware-web-${branch_slug}.vercel.app"
npx vercel alias set "$preview_url" "$branch_url" --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID"

echo "Branch URL: https://${branch_url}"

echo "--- :github: Post preview URL as build annotation"
buildkite-agent annotate \
    --style info \
    --context vercel-preview \
    "Vercel preview: [https://${branch_url}](https://${branch_url})"
