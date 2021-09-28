docker-compose down
yes | docker volume prune
yarn docker:start
yarn wait-be
docker exec -i tree-location-web_postgres_1 psql -d terraware -U postgres < dump/dump.sql
yarn server:prepare
