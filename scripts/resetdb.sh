USER=1
PASS=test1234
TOKEN=$(curl 'http://localhost:8008/api/v1/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw "grant_type=password&username=${USER}&password=${PASS}" | jq -r '.access_token')


curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1}'


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
  --data '{"layer_id":3,"shape_type_id":1}'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 2,\n  "label": "Plant 2",\n  "species_id": 1\n}'

curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1}'

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
  --data '{"layer_id":3,"shape_type_id":1}'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 4,\n  "label": "Plant 4",\n  "species_id": 2\n}'