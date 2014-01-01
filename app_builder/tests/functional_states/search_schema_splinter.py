import time
import re
import unittest
from app_builder.tests.utils import SplinterTestCase
import simplejson

class TestSearch(SplinterTestCase):

    json_file_name = re.sub(r'_splinter\.pyc?', '.json', __file__)
    with open(json_file_name) as f:
        APP_STATE = simplejson.load(f)

    def setUp(self):
        super(TestSearch, self).setUp()
        self.browser.visit(self.url('/'))

    def test_nothing(self):
        raw_input()
