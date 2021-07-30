USER=1
PASS=test1234
TOKEN=$(curl 'http://localhost:8008/api/v1/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw "grant_type=password&username=${USER}&password=${PASS}" | jq -r '.access_token')


curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates":[-75.546518086577947,45.467134581917357]}}'


curl 'http://localhost:8008/api/v1/species' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
}'

curl 'http://localhost:8008/api/v1/species_names' \
   -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' \
  --data-raw $'{\n"name":"Banana",\n "species_id":1}\n'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 1,\n  "label": "Plant 1",\n  "species_id": 1\n}'

curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-75.3372987731628, 45.383321536272049]}}'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 2,\n  "label": "Plant 2",\n  "species_id": 1\n}'

curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-75.898610599532319, 45.295014379864874]}}'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 3,\n  "label": "Plant 3",\n  "species_id": 1\n}'

curl 'http://localhost:8008/api/v1/species' \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  -d '{
}'

  curl 'http://localhost:8008/api/v1/species_names' \
   -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
    -H 'Content-Type: application/json' \
  --data-raw $'{\n"name":"Coconut",\n "species_id":2}\n'


curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-76.898610599532319, 45.595014379864874]}}'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 4,\n  "label": "Plant 4",\n  "species_id": 2\n}'
