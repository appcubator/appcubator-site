#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

cd $DIR

git archive --format=tar HEAD -o build.tar
tar --append --file build.tar appcubator/dist_static/

deis apps:push $DIR/build.tar --app=kabuki-zirconia
