#!/bin/bash
# run_tests.sh
host=$1
echo "Running tests on $host"
xvfb-run phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/editor/
xvfb-run phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/router/
xvfb-run phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/data/
xvfb-run phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/formeditor/
xvfb-run phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/tables/
xvfb-run phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/thirdparty/
