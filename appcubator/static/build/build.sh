cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "Copied main.js to main.js.backup"
lessc --verbose -x --yui-compress --ru --line-numbers=mediaquery ./static/css/app/style.less ./static/css/app/style.css
echo "Compiled app/style.less to app.css"
r.js -o ./static/build/app.build.js
cp ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js
