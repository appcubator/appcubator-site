#!/usr/bin/env bash

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

git archive --format=tar HEAD -o $DIR/build.tar
tar --append --file $DIR/build.tar $DIR/appcubator/dist_static/
deis apps:push $DIR/build.tar --app=kabuki-zirconia
