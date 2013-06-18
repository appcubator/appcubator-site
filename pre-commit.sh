# pre-commit.sh
git stash -q --keep-index

# Test prospective commit
phantomjs appcubator/static/js/test/lib/run_jasmine_test.coffee appcubator/static/js/test/suits/editor-SpecRunner.html
echo "RUNNING TESTS YO"

git stash pop -q

