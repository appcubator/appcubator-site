import time
import re
import os
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

    def create_multiple_data(self):
        self.browser.find_by_name('name')[0].fill("Khadke")
        self.browser.find_by_name('place')[0].fill("Palo Alto")
        self.browser.find_by_name('price')[0].fill("1")
        self.browser.find_by_value('Submit')[0].click()

        self.browser.find_by_name('name')[0].fill("Appcubator")
        self.browser.find_by_name('place')[0].fill("Fremont")
        self.browser.find_by_name('price')[0].fill("10")
        self.browser.find_by_value('Submit')[0].click()

        self.browser.find_by_name('name')[0].fill("Nikhil")
        self.browser.find_by_name('place')[0].fill("Cupertino")
        self.browser.find_by_name('price')[0].fill("2")
        self.browser.find_by_value('Submit')[0].click()

    def test_empty_search(self):
        self.browser.visit(self.url('/Search_Results/'))
        self.browser.find_by_value('Search')[0].click()
        self.assertTrue(self.browser.is_text_present('List is empty.'))

    def test_invalid_search(self):
        self.browser.visit(self.url('/Search_Results/'))
        self.browser.find_by_name('query')[0].fill("Palo Alto")
        self.browser.find_by_value('Search')[0].click()
        self.assertTrue(self.browser.is_text_present('List is empty.'))

    def test_invalid_search_with_data(self):
        self.create_multiple_data()
        self.browser.visit(self.url('/Search_Results/'))
        self.browser.find_by_name('query')[0].fill("Mountain View")
        self.browser.find_by_value('Search')[0].click()
        self.assertTrue(self.browser.is_text_present('List is empty.'))

    def test_valid_search_with_data(self):
        self.create_multiple_data()
        self.browser.visit(self.url('/Search_Results/'))
        self.browser.find_by_name('query')[0].fill("Palo Alto")
        self.browser.find_by_value('Search')[0].click()
        self.assertTrue(self.browser.is_text_present('Palo Alto'))
        self.assertTrue(self.browser.is_text_present('Khadke'))
        self.assertTrue(self.browser.is_text_present('1'))

    def test_valid_search_with_data2(self):
        self.create_multiple_data()
        self.browser.visit(self.url('/Search_Results/'))
        self.browser.find_by_name('query')[0].fill("Palo Alt")
        self.browser.find_by_value('Search')[0].click()
        self.assertTrue(self.browser.is_text_present('Palo Alto'))
        self.assertTrue(self.browser.is_text_present('Khadke'))
        self.assertTrue(self.browser.is_text_present('1'))

    def test_valid_search_with_data3(self):
        self.create_multiple_data()
        self.browser.visit(self.url('/Search_Results/'))
        self.browser.find_by_name('query')[0].fill("a")
        self.browser.find_by_value('Search')[0].click()
        self.assertTrue(self.browser.is_text_present('Palo Alto'))
        self.assertTrue(self.browser.is_text_present('Khadke'))
        self.assertTrue(self.browser.is_text_present('1'))
        self.assertTrue(self.browser.is_text_present('Appcubator'))
        self.assertTrue(self.browser.is_text_present('Fremont'))
        self.assertTrue(self.browser.is_text_present('10'))
