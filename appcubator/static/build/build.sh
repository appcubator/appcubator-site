#!/usr/bin/env bash
# This script NEEDS to be run while in the appcubator-site/appcubator directory (or set PWD equal to that i think)

cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "[BUILD] Copied main.js to main.js.backup"
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/style.less ./static/css/app/style.css
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/editor/editor.less ./static/css/app/editor/editor.css
echo "[BUILD] Compiled app/style.less to app.css"
lessc --verbose --rootpath=/static/css/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/documentation.less ./static/css/documentation.css
echo "[BUILD] Compiled documentation.less to documentation.css"
r.js -o ./static/build/app.build.js
cp ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js

echo "[BUILD] Running manage.py collectstatic"
cd ..
python manage.py collectstatic --noinput
echo "[BUILD] Copying other askbot static files"
cp -r askbot/other_static/* appcubator/dist_static/
echo "[BUILD] Done"
