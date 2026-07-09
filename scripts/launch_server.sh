mkdir -p photo-data/google-drive dist

docker compose "$@" pull
docker compose "$@" up -d

