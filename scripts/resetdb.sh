USER=1
PASS=test1234
TOKEN=$(curl 'http://localhost:8008/api/v1/token' -H 'Content-Type: application/x-www-form-urlencoded' --data-raw "grant_type=password&username=${USER}&password=${PASS}" | jq -r '.access_token')


FEATURE_ID=$(curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates":[-75.546518086577947,45.467134581917357]}}' | jq -r '.id' )

echo "begin test"
echo $FEATURE_ID
echo "end of test"

curl -v "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'


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

FEATURE_ID_2=$(curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-75.3372987731628, 45.383321536272049]}}'| jq -r '.id')
  curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID_2}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 2,\n  "label": "Plant 2",\n  "species_id": 1\n}'

FEATURE_ID_3=$(curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-75.898610599532319, 45.295014379864874]}}'| jq -r '.id')
  curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID_3}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'

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


FEATURE_ID_4=$(curl 'http://localhost:8008/api/v1/features' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data '{"layer_id":3,"shape_type_id":1,"geom":{"type":"Point","coordinates": [-76.898610599532319, 45.595014379864874]}}'| jq -r '.id')
  curl "http://localhost:8008/api/v1/photos?feature_id=${FEATURE_ID_4}&captured_time=2021-02-03T11%3A33%3A44Z" \
  -H 'accept: application/json' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: multipart/form-data' \
  -F 'file=@./scripts/banana.jpeg;type=image/jpeg'

curl 'http://localhost:8008/api/v1/plants' \
  -H "Authorization: Bearer ${TOKEN}" \
  -H 'Content-Type: application/json' \
  --data-raw $'{\n  "feature_id": 4,\n  "label": "Plant 4",\n  "species_id": 2\n}'
