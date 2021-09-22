docker-compose down
yarn docker:start
yarn wait-be
docker exec -i tree-location-web_postgres_1 psql -d terraware -U postgres < dump/dump.sql
