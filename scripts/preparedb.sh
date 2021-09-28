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

echo "---- E2E: adding species records ----"
curl 'http://localhost:8008/api/v1/species' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Banana" }'

curl 'http://localhost:8008/api/v1/species' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Coconut"}'

curl 'http://localhost:8008/api/v1/gis/layers/list/1`' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json'

echo "---- E2E: adding features/plants/photos records ----"
featureId=$(curl 'http://localhost:8008/api/v1/gis/features' \
  -H 'Content-Type: application/json' \
  --data '{"layerId":3,"notes": "Testing notes", "geom":{"type":"Point","coordinates":[-75.546518086577947,45.467134581917357]}, "enteredTime":"'"$LAST_WEEK"'"}' | jq -r '.id' )
curl "http://localhost:8008/api/v1/gis/features/${featureId}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/gis/plants' \
  -H 'Content-Type: application/json' \
  --data '{"featureId": 1,"label": "Plant 1","speciesId": 1}'

featureId_2=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layerId":3,"notes":"Testing other note","geom":{"type":"Point","coordinates": [-75.3372987731628, 45.383321536272049]}, "enteredTime":"'"$LAST_WEEK"'"}'| jq -r '.id')
curl "http://localhost:8008/api/v1/gis/features/${featureId_2}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/gis/plants' \
  -H 'Content-Type: application/json' \
  --data '{"featureId": 2,"label": "Plant 2","speciesId": 1}'

featureId_3=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layerId":3,"geom":{"type":"Point","coordinates": [-75.898610599532319, 45.295014379864874]}, "enteredTime":"'"$LAST_WEEK"'"}'| jq -r '.id')
curl "http://localhost:8008/api/v1/gis/features/${featureId_3}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/gis/plants' \
  -H 'Content-Type: application/json' \
  --data '{"featureId": 3,"label": "Plant 3","speciesId": 1}'

featureId_4=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layerId":3,"geom":{"type":"Point","coordinates": [-76.898610599532319, 45.595014379864874]}, "enteredTime":"'"$NOW"'"}'| jq -r '.id')
curl "http://localhost:8008/api/v1/gis/features/${featureId_4}/photos?capturedTime=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/gis/plants' \
  -H 'Content-Type: application/json' \
  --data '{"featureId": 4,"label": "Plant 4","speciesId": 2}'

echo "---- E2E: finished ----"