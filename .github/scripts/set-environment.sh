#!/bin/bash

set -euo pipefail

# Set a default app version
commit_sha="${GITHUB_SHA:0:12}"
APP_VERSION=$commit_sha

# Store app version in build version file
echo $APP_VERSION > public/build-version.txt

# Define tier based on branch ref
if [[ "$GITHUB_REF" =~ refs/tags/(v[0-9]+\.[0-9.]+) ]]; then
  export TIER=PROD
  APP_VERSION=${BASH_REMATCH[1]}
elif [[ "$GITHUB_REF" == refs/heads/main ]]; then
  export TIER=STAGING
  APP_VERSION=x$APP_VERSION
else
  echo "
IS_CD=false
APP_VERSION=${APP_VERSION}" >> $GITHUB_ENV
  exit
fi

docker_image='terraware/tree-location-app'
docker_tags="${docker_image}:$commit_sha,${docker_image}:${TIER}"

echo "APP_VERSION=$APP_VERSION
COMMIT_SHA=$commit_sha
DOCKER_TAGS=$docker_tags
ECS_CLUSTER_VAR_NAME=${TIER}_ECS_CLUSTER
ECS_SERVICE_VAR_NAME=${TIER}_ECS_SERVICE
IS_CD=true
TIER=$TIER
LOWER_TIER=$(echo $TIER | tr '[:upper:]' '[:lower:]')" >> $GITHUB_ENV

# Define secret names based on the tier; the values of the secrets will be looked up
# by the GitHub Actions steps.
echo "AWS_REGION_SECRET_NAME=${TIER}_AWS_REGION
AWS_ROLE_SECRET_NAME=${TIER}_AWS_ROLE
MIXPANEL_SECRET_NAME=MIXPANEL_${TIER}_TOKEN" >> $GITHUB_ENV
