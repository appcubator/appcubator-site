cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "Copied main.js to main.js.backup"
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/style.less ./static/css/app/style.css
lessc --verbose --rootpath=/static/css/app/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/editor/editor.less ./static/css/app/editor/editor.css
echo "Compiled app/style.less to app.css"
lessc --verbose --rootpath=/static/css/ -x --yui-compress --ru --line-numbers=mediaquery ./static/css/documentation.less ./static/css/documentation.css
echo "Compiled documentation.less to documentation.css"
r.js -o ./static/build/app.build.js
cp ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js
