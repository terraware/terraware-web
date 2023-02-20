#!/bin/sh

echo "---- E2E: start ----"

NOW=$(TZ=UTC date "+%Y-%m-%dT%H:%M:%SZ")

case "$(uname -s)" in

   Darwin)
     echo 'Mac OS X'
     LAST_WEEK=$(TZ=UTC date -v -7d "+%Y-%m-%dT%H:%M:%SZ")
     ;;

   Linux)
     echo 'Linux'
     LAST_WEEK=$(TZ=UTC date -d "last week" "+%Y-%m-%dT%H:%M:%SZ")
     ;;

   *)
     echo 'Other OS' 
     ;;
esac

COOKIE="SESSION=NTZiMGYzYzgtZjY3OS00YmEyLWFkNzgtYzM0ODFiNjM5ZjI0"

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
    docker-compose logs terraware-server
    exit 1
fi

speciesId2=$(curl 'http://localhost:8080/api/v1/species' \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"scientificName":"Coconut","organizationId":1}' | jq -r '.id')

echo "---- E2E: finished ----"
