#!/bin/bash
# optionally pass an argument to semver for what version type to roll
# defaults to patch

# node ./roll-version.js $1

set -x

read -r -p "Are you sure? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
then
  cd ../angular-editor
  npm run build:lib
  cd ../angular-editor-dist

  mkdir temp-keep
  mkdir temp-rm

  cp ./cp-dist.sh temp-keep # add any files we want to preserve to temp-keep
  cp ./cp-dist-local.sh temp-keep

  mv ./* temp-rm
  mv ./temp-rm/temp-keep ~/
  cp -rf ../angular-editor/dist/angular-editor/* ./
  cp -rf ~/temp-keep/* .

  rm -rf ./temp-rm
  rm -rf ./temp-keep

  cp -rf ./* ../epidemiology-webportal/node_modules/@kolkov/angular-editor/
else
    echo Aborted
fi
