#!/usr/bin/env bash
set -e

SPARK_VERSION="${1?Missing required argument: semver}"

sed -i '' -e "s/SPARK_VERSION = .*/SPARK_VERSION = '$SPARK_VERSION'/" lib/constants.js
git add .
git commit -m v"$SPARK_VERSION"
git tag -s v"$SPARK_VERSION" -m v"$SPARK_VERSION"
git push
git push origin v"$SPARK_VERSION"
open https://github.com/filecoin-station/spark/releases/new?tag=v"$SPARK_VERSION"
