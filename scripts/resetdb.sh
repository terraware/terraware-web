#!/bin/sh
docker-compose down --volumes
docker-compose up -d postgres

# Need to wait for the PostgreSQL server to start up and for the database to be
# initialized; it's not enough to just wait for the server to accept connections
# because the Postgres Docker image's init scripts start and then stop the database.

attempts_remaining=30
while [ $attempts_remaining -gt 0 ]; do
    if docker-compose logs postgres | grep -q "PostgreSQL init process complete"; then
        break
    fi

    attempts_remaining=`expr $attempts_remaining - 1`
    sleep 1
done

if [ $attempts_remaining = 0 ]; then
    echo
    echo "No response from PostgreSQL."
    echo

    docker logs terraware-web_postgres_1
    exit 1
fi

if docker exec -i terraware-web_postgres_1 psql -d terraware -U postgres < dump/dump.sql; then
    yarn docker:start
    yarn wait-be
    yarn server:prepare
else
    echo
    echo "Failed to restore database dump."
    echo
    exit 1
fi
