mkdir -p photo-data dist

docker compose "$@" pull
docker compose "$@" up -d

