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

echo "--- :vercel: Deploy to Vercel"
preview_url=$(npx vercel deploy --prebuilt --archive=tgz --token="$VERCEL_TOKEN")

echo "Preview deployed to: ${preview_url}"

echo "--- :github: Post preview URL as build annotation"
buildkite-agent annotate \
    --style info \
    --context vercel-preview \
    "Vercel preview: [${preview_url}](${preview_url})"
