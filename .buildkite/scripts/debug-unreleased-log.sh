#!/bin/bash
#
# Debug version of the unreleased log generation in deploy-docs.sh.
# Simulates the main branch context so it can be run from any branch.
# Echoes output instead of writing to a file.

set -euo pipefail

echo "--- :git: Debug unreleased commits log"

git fetch --tags --depth=1 origin main

LAST_TAG=$(git tag --list --sort=creatordate 'v[0-9]*' | tail -n1)
echo "Last tag: ${LAST_TAG:-<none>}"
echo "HEAD (build commit): $(git rev-parse HEAD)"
echo "origin/main: $(git rev-parse origin/main)"

if [[ -z "$LAST_TAG" ]]; then
    echo "No tags found. All commits from origin/main:"
    git log origin/main --oneline
    exit 0
fi

# Simulate what deploy-docs.sh does on main: progressively deepen origin/main's
# history until the tag is reachable, then print the unreleased commits.
MAX_DEPTH=500
STEP=50
DEPTH=0

while true; do
    if git merge-base --is-ancestor "$LAST_TAG" origin/main 2>/dev/null; then
        echo "Found tag in history at depth=$DEPTH"
        echo "--- Unreleased commits (${LAST_TAG}..origin/main):"
        git log "${LAST_TAG}..origin/main" --oneline
        exit 0
    fi

    if [ "$DEPTH" -ge "$MAX_DEPTH" ]; then
        echo "Could not find history between $LAST_TAG and origin/main after depth=$DEPTH"
        exit 1
    fi

    DEPTH=$((DEPTH + STEP))
    echo "Fetching with depth=$DEPTH"
    git fetch --depth=$DEPTH origin main
    echo "  origin/main: $(git rev-parse origin/main)"
    echo "  tag commit:  $(git rev-list -n1 "$LAST_TAG" 2>/dev/null || echo 'unknown')"
    git log origin/main --oneline -5
done
