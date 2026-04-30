#!/bin/bash
#
# Debug version of the unreleased log generation in deploy-docs.sh.
# Echoes output instead of writing to a file so the issue can be diagnosed
# without merging to main.

set -euo pipefail

echo "--- :git: Debug unreleased commits log"

git fetch --tags --depth=1

LAST_TAG=$(git tag --list --sort=creatordate 'v[0-9]*' | tail -n1)
echo "Last tag: ${LAST_TAG:-<none>}"
echo "HEAD: $(git rev-parse HEAD)"
echo "origin/main: $(git rev-parse origin/main 2>/dev/null || echo 'unknown')"

if [[ -n "$LAST_TAG" ]]; then
    .buildkite/scripts/lib/fetch-tag.sh "$LAST_TAG"
    echo "--- Unreleased commits (${LAST_TAG}..HEAD):"
    git log "${LAST_TAG}..HEAD" --oneline
else
    echo "No tags found. All commits from HEAD:"
    git log HEAD --oneline
fi
