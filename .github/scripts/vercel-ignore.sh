#!/bin/bash

if [[ $VERCEL_GIT_COMMIT_REF =~ "gh-pages" ]] ; then
  echo ">> Skip deploy"
  exit 0;
else
  echo ">> Proceed with deploy"
  exit 1; 
fi