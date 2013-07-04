# run_tests.sh

phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee http://127.0.0.1:8000/test/editor/
phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee http://127.0.0.1:8000/test/router/
phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee http://127.0.0.1:8000/test/data/
phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee http://127.0.0.1:8000/test/formeditor/
phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee http://127.0.0.1:8000/test/tables/
phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee http://127.0.0.1:8000/test/thirdparty/

