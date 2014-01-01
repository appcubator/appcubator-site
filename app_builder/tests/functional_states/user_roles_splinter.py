import time
import re
import unittest
from app_builder.tests.utils import SplinterTestCase
import simplejson

class TestUserRoles(SplinterTestCase):

    json_file_name = re.sub(r'_splinter\.pyc?', '.json', __file__)
    with open(json_file_name) as f:
        APP_STATE = simplejson.load(f)

    def signup_weirdo(self, email):
        self.browser.visit(self.url('/'))
        signup_form = self.browser.find_by_tag('form')[0]
        signup_form.find_by_name('email').fill('email')
        signup_form.find_by_name('name').fill('karan')
        signup_form.find_by_name('password').fill('123')
        signup_form.find_by_css('input.btn').click()
        time.sleep(1)


    def signup_user(self, email):
        self.browser.visit(self.url('/'))
        signup_form = self.browser.find_by_tag('form')[1]
        signup_form.find_by_name('email').fill('email')
        signup_form.find_by_name('name').fill('karan')
        signup_form.find_by_name('password').fill('123')
        signup_form.find_by_css('input.btn').click()
        time.sleep(1)


    def test_(self):
        self.browser.visit(self.url('/'))
        #raw_input()
        self.assertFalse(True)
