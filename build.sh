#!/usr/bin/env bash
set -e
# NOTE: `r.js -v` should be 2.1.5

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

pushd $DIR/appcubator

# compile less/
cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "[BUILD] Copied main.js to main.js.backup"
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/app.less ./dist_static/css/app/app.css
echo "[BUILD] Compiled app/style.less to app.css"
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/internal.less ./dist_static/css/internal.css
echo "[BUILD] Compiled app/style.less to internal.css"
lessc --verbose --rootpath=/static/css/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/documentation.less ./dist_static/css/documentation.css
echo "[BUILD] Compiled documentation.less to documentation.css"
lessc --verbose --rootpath=/static/css/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/external-website.less ./dist_static/css/external-website.css
echo "[BUILD] Compiled external-website.less to external-website.css"

# fix /static/
sed -i '' 's/\/static\//https:\/\/s3.amazonaws.com\/appcubator-hosting\//g' ./dist_static/css/app/app.css
sed -i '' 's/\/static\//https:\/\/s3.amazonaws.com\/appcubator-hosting\//g' ./dist_static/css/internal.css
sed -i '' 's/\/static\//https:\/\/s3.amazonaws.com\/appcubator-hosting\//g' ./dist_static/css/documentation.css
sed -i '' 's/\/static\//https:\/\/s3.amazonaws.com\/appcubator-hosting\//g' ./dist_static/css/external-website.css

# compile javascript

#r.js -o ./static/build/app.build.js
#mv ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js

echo "[BUILD] Running manage.py collectstatic"

popd

python manage.py collectstatic --noinput

echo "[BUILD] Done"
