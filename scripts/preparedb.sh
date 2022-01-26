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
  --data '{"name":"Banana","organizationId":1}' | jq -r '.id')

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
  --data '{"name":"Coconut","organizationId":1}' | jq -r '.id')

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
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId''',"label": "Plant 1","speciesId": '''$speciesId1'''}'
metadata='{"capturedTime":"2021-09-21T00:53:21.328Z"}'  
curl "http://localhost:8080/api/v1/gis/features/${featureId}/photos" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg' \
  -F 'metadata='''$metadata''';type=application/json'  

featureId2=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId":1,"notes":"Testing other note","geom":{"type":"Point","coordinates": [-75.3372987731628, 45.383321536272049]}, "enteredTime":"'"$LAST_WEEK"'"}'| jq -r '.feature.id')
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId2''',"label": "Plant 2","speciesId": '''$speciesId1'''}'
curl "http://localhost:8080/api/v1/gis/features/${featureId2}/photos" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg' \
  -F 'metadata='''$metadata''';type=application/json'    

featureId3=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId":1,"geom":{"type":"Point","coordinates": [-75.898610599532319, 45.295014379864874]}, "enteredTime":"'"$LAST_WEEK"'"}'| jq -r '.feature.id')
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId3''',"label": "Plant 3","speciesId": '''$speciesId1'''}'
curl "http://localhost:8080/api/v1/gis/features/${featureId3}/photos" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg' \
  -F 'metadata='''$metadata''';type=application/json'    

featureId4=$(curl 'http://localhost:8080/api/v1/gis/features' \
  --cookie "${COOKIE}" \
  -H 'Content-Type: application/json' \
  --data '{"layerId":'''$layerId''',"geom":{"type":"Point","coordinates": [-76.898610599532319, 45.595014379864874]}, "enteredTime":"'"$NOW"'"}'| jq -r '.feature.id')
curl 'http://localhost:8080/api/v1/gis/plants' \
  --cookie "${COOKIE}"  \
  -H 'Content-Type: application/json' \
  --data '{"featureId": '''$featureId4''',"label": "Plant 4","speciesId": '''$speciesId2'''}'
curl "http://localhost:8080/api/v1/gis/features/${featureId4}/photos" \
  --cookie "${COOKIE}"  \
  -H 'accept: application/json' \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/coconut.jpeg;type=image/jpeg' \
  -F 'metadata='''$metadata''';type=application/json'  

echo "---- E2E: finished ----"
