#!/bin/sh

echo "---- E2E: start ----"

NOW=$(TZ=UTC date "+%Y-%m-%dT%H:%M:%SZ")

COOKIE="SESSION=Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh"

echo "---- E2E: adding species records ----"
speciesId1=$(curl 'http://localhost:8080/api/v1/species' \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"scientificName":"Banana","organizationId":1}' | jq -r '.id')

if [ -z "$speciesId1" ]; then
    echo
    echo Failed to make request to server
    echo
    docker compose logs terraware-server
    exit 1
fi

# species 2
curl 'http://localhost:8080/api/v1/species' \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"scientificName":"Coconut","organizationId":1}' | jq -r '.id'

echo "---- E2E: finished ----"
