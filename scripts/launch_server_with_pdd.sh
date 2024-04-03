mkdir -p photo-data pdd-photo-data

aws --profile staging ecr get-login-password \
  | docker login \
      --username AWS \
      --password-stdin \
      TODO.dkr.ecr.us-west-2.amazonaws.com

docker-compose -f docker-compose-with-pdd.yml pull
docker-compose -f docker-compose-with-pdd.yml up -d
