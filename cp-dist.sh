#!/bin/bash
# optionally pass an argument to semver for what version type to roll
# defaults to patch

# node ./roll-version.js $1

set -x

read -r -p "Are you sure? [y/N] " response
if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]
then
  cd ../angular-editor
  npm run build-prod:lib
  cd ../angular-editor-dist
  git checkout .

  mkdir temp-keep
  mkdir temp-rm

  cp ./cp-dist.sh temp-keep # add any files we want to preserve to temp-keep
  mv ./* temp-rm
  mv ./temp-rm/temp-keep ./
  cp -rf ../angular-editor/dist/angular-editor/* ./
  cp -rf ./temp-keep/* .

  rm -rf ./temp-rm
  rm -rf ./temp-keep

  git add .
  git commit -m"update package"
  git push

else
    echo Aborted
fi
