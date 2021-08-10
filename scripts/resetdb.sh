yarn docker:stop
yes | docker volume prune
yarn docker:start
yarn wait-be
yarn server:prepare
