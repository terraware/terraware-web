docker-compose up -d -- db
sleep 5  # Waits 5 seconds.
docker-compose run web python tools.py -p -g
docker-compose up -d
