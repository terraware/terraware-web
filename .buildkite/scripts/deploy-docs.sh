#!/bin/bash
#
# Deploy docs to GitHub Pages.
# Replaces docs.yml and the gitlog step from GHA main.yml.

set -euo pipefail

.buildkite/scripts/install-deps.sh --node --tools

# Allow generated docs to be committed to gh-pages branch
rm -f docs/.gitignore

echo "--- :yarn: Output license report"
yarn license-report

echo "--- :yarn: Generate strings"
yarn generate-strings

echo "--- :jest: Run unit tests to generate coverage"
yarn test-coverage

echo "--- :git: Generate unreleased commits log"

git fetch --tags --depth=1
LAST_TAG=$(git tag --list --sort=creatordate 'v[0-9]*' | tail -n1)

if [[ -n "$LAST_TAG" ]]; then
    .buildkite/scripts/lib/fetch-tag.sh "$LAST_TAG"
    git log "${LAST_TAG}..HEAD" --oneline > docs/unreleased.log
else
    git log HEAD --oneline > docs/unreleased.log
fi

# This section is a port of GHA's github-pages-deploy-action, with retries for when
# another build pushes to the deploy branch while this one is running.

DEPLOY_DIR="docs"
DEPLOY_BRANCH="gh-pages"
DEPLOY_USER="terraformation-deploy"
MAX_ATTEMPTS=3

REPO_URL=${BUILDKITE_REPO/github.com/$DEPLOY_USER:$GITHUB_TOKEN@github.com}

# A newer build will deploy its own docs, so there's no need to deploy stale ones.
exit_if_superseded() {
    local main_commit
    main_commit=$(git ls-remote "$REPO_URL" refs/heads/main | cut -f1)

    if [[ "$main_commit" != "$BUILDKITE_COMMIT" ]]; then
        echo "main has moved to ${main_commit:0:12}; skipping docs deploy."
        exit 0
    fi
}

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

echo "--- :github: Clone $DEPLOY_BRANCH"

git clone --branch "$DEPLOY_BRANCH" --single-branch --depth 1 "$REPO_URL" "$TEMP_DIR"

git -C "$TEMP_DIR" config user.name "Buildkite CI"
git -C "$TEMP_DIR" config user.email "nobody@terraformation.com"

for ATTEMPT in $(seq 1 "$MAX_ATTEMPTS"); do
    echo "--- :github: Deploy to GitHub Pages (attempt $ATTEMPT)"

    exit_if_superseded

    if [[ "$ATTEMPT" -gt 1 ]]; then
        # Discard the rejected commit and start over from the latest remote state.
        git -C "$TEMP_DIR" fetch --depth 1 origin "$DEPLOY_BRANCH"
        git -C "$TEMP_DIR" reset --hard FETCH_HEAD
    fi

    rsync -a --exclude=.git --delete "$DEPLOY_DIR/" "$TEMP_DIR/"

    git -C "$TEMP_DIR" add -A

    if git -C "$TEMP_DIR" diff --cached --quiet; then
        echo "No changes to deploy."
        exit 0
    fi

    git -C "$TEMP_DIR" commit -m "Deploy docs from ${BUILDKITE_COMMIT:0:12}"

    if git -C "$TEMP_DIR" push origin "$DEPLOY_BRANCH"; then
        echo "Docs deployed to GitHub Pages."
        exit 0
    fi

    echo "Push failed; retrying."
    sleep $((ATTEMPT * 5))
done

echo "Failed to deploy docs after $MAX_ATTEMPTS attempts."
exit 1
