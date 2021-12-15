#!/bin/sh
docker-compose down --volumes
docker-compose up -d postgres

# Need to wait for the PostgreSQL server to start up and for the database to be
# initialized; it's not enough to just wait for the server to accept connections.
attempts_remaining=30
while [ $attempts_remaining -gt 0 ]; do
    if docker exec -i tree-location-web_postgres_1 psql -d terraware -U postgres < dump/dump.sql; then
        break
    fi
    attempts_remaining=`expr $attempts_remaining - 1`
done

if [ $attempts_remaining = 0 ]; then
    echo
    echo "No response from PostgreSQL."
    echo

    docker logs tree-location-web_postgres_1
    exit 1
fi

yarn docker:start
yarn wait-be
