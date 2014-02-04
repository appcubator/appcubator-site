#!/usr/bin/env bash
set -e
DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR

git archive --format=tar HEAD -o build.tar
tar --append --file build.tar appcubator/dist_static/

gzip build.tar

deis apps:push $DIR/build.tar.gz --app=kabuki-zirconia
