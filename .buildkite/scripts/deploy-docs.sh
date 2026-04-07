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

# This section is a port of GHA's github-pages-deploy-action.

echo "--- :github: Prepare files for deployment"

DEPLOY_DIR="docs"
DEPLOY_BRANCH="gh-pages"
DEPLOY_USER="terraformation-deploy"

REPO_URL=${BUILDKITE_REPO/github.com/$DEPLOY_USER:$GITHUB_TOKEN@github.com}

# Set up a temporary directory for the gh-pages branch
TEMP_DIR=$(mktemp -d)
trap 'rm -rf "$TEMP_DIR"' EXIT

git clone --branch "$DEPLOY_BRANCH" --single-branch --depth 1 \
    "$REPO_URL" \
    "$TEMP_DIR" || {
        # If gh-pages doesn't exist yet, create it as an orphan
        git init "$TEMP_DIR"
        cd "$TEMP_DIR"
        git checkout --orphan "$DEPLOY_BRANCH"
        git remote add origin "$REPO_URL"
        cd -
    }

# Sync docs into the deploy directory
rsync -a --exclude=.git --delete "$DEPLOY_DIR/" "$TEMP_DIR/"

cd "$TEMP_DIR"
git add -A

if git diff --cached --quiet; then
    echo "No changes to deploy."
    exit 0
fi

echo "--- :github: Deploy to GitHub Pages"

git config user.name "Buildkite CI"
git config user.email "nobody@terraformation.com"
git commit -m "Deploy docs from ${BUILDKITE_COMMIT:0:12}"
git push origin "$DEPLOY_BRANCH"

echo "Docs deployed to GitHub Pages."
