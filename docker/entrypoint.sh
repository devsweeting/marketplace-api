#!/bin/bash
yarn --version
node -v
ulimit -c unlimited
if [[ "$NODE_ENV" == "develop" ]]; then
  yarn dev
else
  yarn start:prod
fi
