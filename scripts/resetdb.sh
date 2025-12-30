#!/bin/sh
set -e

restore_dump() {
    if docker compose exec -T postgres psql -d terraware -U postgres < "$1"; then
        :
    else
        echo
        echo "Failed to restore $1."
        echo
        exit 1
    fi
}

rm -rf $HOME/docker/volumes/postgres/data
docker compose down --volumes
docker compose up -d postgres

# Need to wait for the PostgreSQL server to start up and for the database to be
# initialized; it's not enough to just wait for the server to accept connections
# because the Postgres Docker image's init scripts start and then stop the database.

attempts_remaining=45
while [ $attempts_remaining -gt 0 ]; do
    if docker compose logs postgres | grep -q "PostgreSQL init process complete"; then
        break
    fi

    ((attempts_remaining=attempts_remaining-1))
    sleep 1
done

if [ $attempts_remaining = 0 ]; then
    echo
    echo "No response from PostgreSQL."
    echo

    docker compose logs postgres
    exit 1
fi

restore_dump dump/dump.sql

yarn docker:start:prod
if yarn wait-be; then
    :
else
    docker compose logs terraware-server
    exit 1
fi

restore_dump dump/session.sql

yarn server:prepare
