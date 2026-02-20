mkdir -p photo-data build

docker compose "$@" pull
docker compose "$@" up -d

