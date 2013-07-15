#!/bin/bash
# run_tests.sh
host=$1
echo "Running tests on $host"
phantomjs /var/www/appcubator-site/appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/editor/
phantomjs /var/www/appcubator-site/appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/router/
phantomjs /var/www/appcubator-site/appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/data/
phantomjs /var/www/appcubator-site/appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/formeditor/
phantomjs /var/www/appcubator-site/appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/tables/
phantomjs /var/www/appcubator-site/appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/thirdparty/
