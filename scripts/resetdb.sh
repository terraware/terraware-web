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

docker compose --profile prod down --volumes
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
    collected_time = DATE_TRUNC('year', CURRENT_DATE),
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

UPDATE accelerator.project_modules
SET end_date = CURRENT_DATE + 1
WHERE module_id = 1000;

UPDATE users
SET cookies_consented = true,
    cookies_consented_time = DATE_TRUNC('year', CURRENT_DATE) + TIME '20:12:54.827407+00';

-- Botanical countries are imported from the TDWG GeoJSON dataset, which the dump doesn't carry.
-- Seed a few, with placeholder boundaries, so species nativity can be exercised in tests.
INSERT INTO public.botanical_countries (name, level3_code, level2_code, level1_code, boundary)
VALUES ('Colombia', 'CLM', 83, 8, public.ST_GeomFromText('POLYGON((0 0, 1 0, 1 1, 0 1, 0 0))', 4326)),
       ('Costa Rica', 'COS', 80, 8, public.ST_GeomFromText('POLYGON((2 0, 3 0, 3 1, 2 1, 2 0))', 4326)),
       ('Guatemala', 'GUA', 80, 8, public.ST_GeomFromText('POLYGON((4 0, 5 0, 5 1, 4 1, 4 0))', 4326)),
       ('Kenya', 'KEN', 25, 2, public.ST_GeomFromText('POLYGON((6 0, 7 0, 7 1, 6 1, 6 0))', 4326)),
       ('Philippines', 'PHI', 42, 4, public.ST_GeomFromText('POLYGON((8 0, 9 0, 9 1, 8 1, 8 0))', 4326))
ON CONFLICT (level3_code) DO NOTHING;

INSERT INTO public.country_botanical_countries (country_code, botanical_country_code)
VALUES ('CO', 'CLM'), ('CR', 'COS'), ('GT', 'GUA'), ('KE', 'KEN'), ('PH', 'PHI')
ON CONFLICT DO NOTHING;
"
docker compose exec postgres psql -d terraware -U postgres -c "$UPDATE_STRING"

echo "Removing local files"
rm -rf photo-data/google-drive

yarn docker:start:prod
if yarn wait-be; then
    :
else
    docker compose logs terraware-server
    exit 1
fi

restore_dump dump/session.sql

yarn server:prepare
