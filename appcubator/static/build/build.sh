cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "Copied main.js to main.js.backup"
lessc -x --yui-compress ./static/css/style.less ./static/css/style.css
r.js -o ./static/build/app.build.js
cp ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js
cd ./dist_static
rm -rf build
