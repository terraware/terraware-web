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

# Update some data to make the tests work
UPDATE_STRING="
UPDATE seedbank.accessions
SET number = TO_CHAR(CURRENT_DATE, 'YY') || '-1-2-001',
    collected_date = DATE_TRUNC('year', CURRENT_DATE),
    received_date = DATE_TRUNC('year', CURRENT_DATE),
    created_time = DATE_TRUNC('year', CURRENT_DATE) + TIME '20:12:54.827407+00',
    modified_time = DATE_TRUNC('year', CURRENT_DATE) + TIME '20:12:54.827407+00'
WHERE number = '25-1-2-001';

UPDATE nursery.batches
SET batch_number = TO_CHAR(CURRENT_DATE, 'YY') || '-2-1-001',
    added_date = DATE_TRUNC('year', CURRENT_DATE),
    created_time = DATE_TRUNC('year', CURRENT_DATE) + TIME '20:12:54.827407+00',
    modified_time = DATE_TRUNC('year', CURRENT_DATE) + TIME '20:12:54.827407+00'
WHERE batch_number = '25-2-1-001';

UPDATE public.identifier_sequences
SET prefix = TO_CHAR(CURRENT_DATE, 'YY') || SUBSTRING(prefix FROM 3)
WHERE prefix ~ '^\d{2}-';

UPDATE accelerator.cohort_modules
SET end_date = CURRENT_DATE + 1
WHERE module_id = 1000;
"
docker compose exec postgres psql -d terraware -U postgres -c "$UPDATE_STRING"

yarn docker:start:prod
if yarn wait-be; then
    :
else
    docker compose logs terraware-server
    exit 1
fi

restore_dump dump/session.sql

yarn server:prepare
