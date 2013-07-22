#!/bin/bash
# run_tests.sh
host=$1
echo "Running tests on $host"
phantomjs ./appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/editor/
phantomjs ./appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/router/
phantomjs ./appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/data/
phantomjs ./appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/formeditor/
phantomjs ./appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/tables/
phantomjs ./appcubator/static/js/test/lib/run_jasmine_test.coffee $host/test/thirdparty/
