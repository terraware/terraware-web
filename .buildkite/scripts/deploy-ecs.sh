#!/bin/bash

set -euo pipefail

case "$TIER" in
    PROD)
        ECS_CLUSTER=prod-terraware-cluster
        ECS_SERVICE=prod-terraware-frontend
        ;;
    STAGING)
        ECS_CLUSTER=staging-terraware-cluster
        ECS_SERVICE=staging-terraware-frontend
        ;;
    *)
        echo "--- :amazon-ecs: No ECS deploy needed for ${TIER} builds."
        exit 0
        ;;
esac

echo "--- :amazon-ecs: Deploying to ECS cluster=${ECS_CLUSTER} service=${ECS_SERVICE}"

aws ecs update-service \
    --cluster "$ECS_CLUSTER" \
    --service "$ECS_SERVICE" \
    --force-new-deployment

echo "--- :amazon-ecs: Waiting for ECS deployment to stabilize"
aws ecs wait services-stable \
    --cluster "$ECS_CLUSTER" \
    --service "$ECS_SERVICE"

echo "Deployment stable."
