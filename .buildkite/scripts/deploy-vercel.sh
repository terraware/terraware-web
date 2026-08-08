#!/bin/bash
#
# Deploy a preview to Vercel for pull request builds.
# Replaces vercel.yml from GHA.

set -euo pipefail

.buildkite/scripts/install-deps.sh --tools

# Read the labels from GitHub rather than build.pull_request.labels, which Buildkite snapshots when
# it creates the build. The snapshot is empty for a label added after the fact, and rebuilding
# reuses it, so a preview could only ever be requested by pushing a new commit.
PREVIEW_LABEL='Vercel preview'

if [[ "${BUILDKITE_PULL_REQUEST:-false}" == "false" ]]; then
    echo "Not a pull request build; skipping preview."
    exit 0
fi

echo "--- :github: Check PR #${BUILDKITE_PULL_REQUEST} for the \"${PREVIEW_LABEL}\" label"

pull_request=$(curl -sS --fail --max-time 30 \
    -H "Authorization: token ${GITHUB_TOKEN}" \
    -H "Accept: application/vnd.github.v3+json" \
    "https://api.github.com/repos/terraware/terraware-web/pulls/${BUILDKITE_PULL_REQUEST}")

has_label=$(jq -r --arg want "$PREVIEW_LABEL" 'any(.labels[]; .name == $want)' <<< "$pull_request")

if [[ "$has_label" != "true" ]]; then
    echo "No \"${PREVIEW_LABEL}\" label; skipping preview."
    echo "Add the label and re-run this build to deploy one."
    exit 0
fi

.buildkite/scripts/install-deps.sh --node

echo "--- :vercel: Configure Vercel project"
mkdir -p .vercel
echo "{\"projectId\":\"${VERCEL_PROJECT_ID}\",\"orgId\":\"${VERCEL_ORG_ID}\"}" > .vercel/project.json

echo "--- :vercel: Pull Vercel project settings"
npx vercel pull --yes --environment=preview --token="$VERCEL_TOKEN"

echo "--- :vercel: Build project"
npx vercel build --token="$VERCEL_TOKEN"

echo "--- :vercel: Deploy to Vercel"
preview_url=$(npx vercel deploy --prebuilt --archive=tgz --token="$VERCEL_TOKEN" --meta githubCommitRef="$BUILDKITE_BRANCH")

echo "Preview deployed to: ${preview_url}"

echo "--- :vercel: Alias deployment to branch URL"
branch_slug=$(echo "$BUILDKITE_BRANCH" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]/-/g')

# DNS labels are limited to 63 characters. The "terraware-web-" prefix is
# 14 characters, leaving 49 for the slug. For longer branch names, truncate
# and append a hash of the original branch so the alias stays unique.
max_slug_length=49
if [ ${#branch_slug} -gt $max_slug_length ]; then
  hash=$(echo -n "$BUILDKITE_BRANCH" | shasum | cut -c1-8)
  truncated="${branch_slug:0:$((max_slug_length - ${#hash} - 1))}"
  truncated="${truncated%-}"
  branch_slug="${truncated}-${hash}"
fi

branch_url="terraware-web-${branch_slug}.vercel.app"
npx vercel alias set "$preview_url" "$branch_url" --token="$VERCEL_TOKEN" --scope="$VERCEL_ORG_ID"

echo "Branch URL: https://${branch_url}"

echo "--- :github: Post preview URL as build annotation"
buildkite-agent annotate \
    --style info \
    --context vercel-preview \
    "Vercel preview: [https://${branch_url}](https://${branch_url})"
