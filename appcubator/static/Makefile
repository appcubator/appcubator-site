all: build

build:
	make lint
	make clean
	mkdir -p public
	mkdir -p public/js
	mkdir -p public/css

	# build vendors
	./node_modules/browserify/bin/cmd.js vendors/vendors.coffee >> public/js/vendors.js
	# build appcubator-site
	./node_modules/browserify/bin/cmd.js src/main.coffee >> public/js/jsonbrowser.js
	# TODO: build appcubator-plugin

	# compile less

buildw:
	./node_modules/coffee-script/bin/coffee scripts/watch.coffee . make build

# test:
# 	make
# 	mkdir -p test/lib

clean:
	rm -rf public

lint:
	./node_modules/coffeelint/bin/coffeelint -f lint.config.json -r src

# dist:

.PHONY: build clean lint test

