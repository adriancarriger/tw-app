#!/bin/sh

set -e

# Run from parent directory
cd "$( dirname "$0" )" && cd ..

if [[ ! -d ~/.netlify ]]; then
  mkdir ~/.netlify
fi

echo "{\"access_token\":\"$NETLIFY_CLI_TOKEN\"}" > ~/.netlify/config

if [[ $CIRCLE_BRANCH == "develop" ]]; then
  VUE_APP_SERVER_URI=$SERVER_URI_STAGING \
    VUE_APP_URI=$APP_URI_STAGING \
    yarn run build
  yarn run deploy
fi

if [[ $CIRCLE_BRANCH == "master" ]]; then
  VUE_APP_SERVER_URI=$SERVER_URI_PRODUCTION \
    VUE_APP_URI=$APP_URI_PRODUCTION \
    yarn run build
  yarn run deploy -e production
fi
