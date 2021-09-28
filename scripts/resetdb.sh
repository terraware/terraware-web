yarn docker:stop
yes | docker volume prune
yarn docker:start
yarn wait-be
docker exec -i seedbank-app_postgres_1 psql -d terraware -U postgres < dump/dump.sql
