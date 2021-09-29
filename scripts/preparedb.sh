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

COOKIE="SESSION=Mjc2NzE0YWQtYWIwYS00OGFhLThlZjgtZGI2NWVjMmU5NTBh"

echo "---- E2E: adding species records ----"
speciesId1=$(curl 'http://localhost:8080/api/v1/species' \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Banana" }' | jq -r '.id')

speciesId2=$(curl 'http://localhost:8080/api/v1/species' \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Coconut"}' | jq -r '.id')

layerId=$(curl 'http://localhost:8080/api/v1/gis/layers' \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"siteId":10, "layerType": "Plants Planted", "tileSetName": "Some tile set name", "proposed": "false", "hidden": "false"}' | jq -r '.layer.id')

echo "---- E2E: adding features/plants/photos records ----"
featureId=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId": '''$layerId''',"notes": "Testing notes", "geom":{"type":"Point","coordinates":[-75.546518086577947,45.467134581917357]}, "enteredTime":"'"$LAST_WEEK"'"}' | jq -r '.feature.id' )
curl "http://localhost:8080/api/v1/gis/features/${featureId}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId''',"label": "Plant 1","speciesId": '''$speciesId1'''}'

featureId2=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId":1,"notes":"Testing other note","geom":{"type":"Point","coordinates": [-75.3372987731628, 45.383321536272049]}, "enteredTime":"'"$LAST_WEEK"'"}'| jq -r '.feature.id')
curl "http://localhost:8080/api/v1/gis/features/${featureId2}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId2''',"label": "Plant 2","speciesId": '''$speciesId1'''}'

featureId3=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId":1,"geom":{"type":"Point","coordinates": [-75.898610599532319, 45.295014379864874]}, "enteredTime":"'"$LAST_WEEK"'"}'| jq -r '.feature.id')
curl "http://localhost:8080/api/v1/gis/features/${featureId3}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId3''',"label": "Plant 3","speciesId": '''$speciesId1'''}'

featureId4=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId":'''$layerId''',"geom":{"type":"Point","coordinates": [-76.898610599532319, 45.595014379864874]}, "enteredTime":"'"$NOW"'"}'| jq -r '.feature.id')
curl "http://localhost:8080/api/v1/gis/features/${featureId4}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId4''',"label": "Plant 4","speciesId": '''$speciesId2'''}'

echo "---- E2E: finished ----"