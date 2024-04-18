#!/bin/bash

set -euo pipefail

# Set a default app version
commit_sha="${GITHUB_SHA:0:12}"
APP_VERSION=$commit_sha

# Define tier based on branch ref
if [[ "$GITHUB_REF" =~ refs/tags/(v[0-9]+\.[0-9.]+) ]]; then
  export TIER=PROD
  export IS_CD=true
  APP_VERSION=${BASH_REMATCH[1]}
elif [[ "$GITHUB_REF" == refs/heads/main ]]; then
  export TIER=STAGING
  export IS_CD=true
elif [[ "$GITHUB_REF" == refs/heads/qa ]]; then
  export TIER=QA
  export IS_CD=true
else
  echo "IS_CD=false" >> $GITHUB_ENV
  exit
fi

docker_image='terraware/tree-location-app'
docker_tags="${docker_image}:$commit_sha,${docker_image}:${TIER}"

# Define secret names based on the tier
echo "TIER=$TIER
IS_CD=$IS_CD
SSH_KEY_SECRET_NAME=${TIER}_SSH_KEY
SSH_USER_SECRET_NAME=${TIER}_SSH_USER
AWS_REGION_SECRET_NAME=${TIER}_AWS_REGION
AWS_ROLE_SECRET_NAME=${TIER}_AWS_ROLE
COMMIT_SHA=$commit_sha
DOCKER_TAGS=$docker_tags
APP_VERSION=$APP_VERSION" >> $GITHUB_ENV

# Store app version in build version file
echo $APP_VERSION > public/build-version.txt
