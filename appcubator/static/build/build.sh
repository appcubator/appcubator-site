cp ./static/js/application/main-app/main.js ./static/js/application/main-app/main.js.backup
echo "Copied main.js to main.js.backup"
r.js -o ./static/build/app.build.js
cp ./static/js/application/main-app/main.js.backup ./static/js/application/main-app/main.js
cd ./dist_static
rm -rf build 
