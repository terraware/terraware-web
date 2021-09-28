#!/bin/sh
docker-compose down
yarn docker:start
if yarn wait-be; then
    docker exec -i tree-location-web_postgres_1 psql -d terraware -U postgres < dump/dump.sql
else
    echo
    echo "No response from back end"
    echo

    docker logs tree-location-web_terraware-server_1
    exit 1
fi
