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
  -d '{
}'
curl 'http://localhost:8008/api/v1/species_names' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Banana","species_id": 1 }'

curl 'http://localhost:8008/api/v1/species' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
}'
curl 'http://localhost:8008/api/v1/species_names' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  --data '{"name":"Coconut","species_id":2}'

echo "---- E2E: adding features/plants/photos records ----"
FEATURE_ID=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"notes": "Testing notes", "geom":{"type":"Point","coordinates":[-75.546518086577947,45.467134581917357]}, "entered_time":"'"$LAST_WEEK"'"}' | jq -r '.id' )
curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/plants' \
  -H 'Content-Type: application/json' \
  --data '{"feature_id": 1,"label": "Plant 1","species_id": 1}'

FEATURE_ID_2=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"notes":"Testing other note","geom":{"type":"Point","coordinates": [-75.3372987731628, 45.383321536272049]}, "entered_time":"'"$LAST_WEEK"'"}'| jq -r '.id')
curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID_2}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/plants' \
  -H 'Content-Type: application/json' \
  --data '{"feature_id": 2,"label": "Plant 2","species_id": 1}'

FEATURE_ID_3=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-75.898610599532319, 45.295014379864874]}, "entered_time":"'"$LAST_WEEK"'"}'| jq -r '.id')
curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID_3}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/plants' \
  -H 'Content-Type: application/json' \
  --data '{"feature_id": 3,"label": "Plant 3","species_id": 1}'

FEATURE_ID_4=$(curl 'http://localhost:8008/api/v1/features' \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-76.898610599532319, 45.595014379864874]}, "entered_time":"'"$NOW"'"}'| jq -r '.id')
curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID_4}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'
curl 'http://localhost:8008/api/v1/plants' \
  -H 'Content-Type: application/json' \
  --data '{"feature_id": 4,"label": "Plant 4","species_id": 2}'

echo "---- E2E: finished ----"
