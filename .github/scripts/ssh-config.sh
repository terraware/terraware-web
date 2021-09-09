#!/bin/bash

mkdir -p ~/.ssh/
echo "$SSH_KEY" > ~/.ssh/staging.key
chmod 600 ~/.ssh/staging.key
cat >> ~/.ssh/config <<END
Host bastion
  HostName $SSH_HOST
  User $SSH_USER
  IdentityFile ~/.ssh/staging.key
  StrictHostKeyChecking no
END
