#!/bin/sh
set -e

DB_TYPE=$1

echo "deleting unnecessary/sensitive stuff from db"
UPDATE_STRING="
DELETE FROM jobrunr_metadata;
DELETE FROM jobrunr_recurring_jobs;

UPDATE accelerator.project_accelerator_details
SET google_folder_url = concat('https://drive.google.com/drive/folders/', project_id);
"

if [[ $DB_TYPE = "docker" ]]; then
  echo "Dumping db from docker"
  docker compose exec postgres psql -U postgres terraware -c "$UPDATE_STRING"
  docker compose exec postgres pg_dump -O -x -U postgres terraware > dump/dump.sql
else
  echo "Dumping db from local"
  psql terraware -c "$UPDATE_STRING"
  pg_dump -O -x -f dump/dump.sql terraware
fi
