mkdir -p photo-data/google-drive dist

# The terraware-server image runs as uid 1001. On Linux (CI) bind mounts keep
# the host's ownership, so uid 1001 can't write to these host-owned dirs and
# file uploads fail with AccessDeniedException. Make them world-writable so the
# container can write regardless of uid. (No-op effect on macOS, where Docker
# Desktop already remaps bind-mount ownership to the container uid.)
chmod -R 777 photo-data

docker compose "$@" pull
docker compose "$@" up -d

