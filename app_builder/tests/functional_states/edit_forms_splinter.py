import time
import re
import os
import unittest
from app_builder.tests.utils import SplinterTestCase
import simplejson

class TestCreateSimpleList(SplinterTestCase):

    json_file_name = re.sub(r'_splinter\.pyc?', '.json', __file__)
    with open(json_file_name) as f:
        APP_STATE = simplejson.load(f)

    def setUp(self):
        super(TestCreateSimpleList, self).setUp()
        self.browser.visit(self.url('/'))

    def login_to_facebook(self):
        assert 'facebook.com' in self.browser.url
        email_input = self.browser.find_by_id('email')[0]
        email_input.fill(os.environ['FB_USERNAME'])
        passwd_input = self.browser.find_by_id('pass')[0]
        passwd_input.fill(os.environ['FB_PASSWD'])
        self.browser.find_by_name('login')[0].click()

    def tweet(self, s):
        self.browser.visit(self.url('/Tweet_Feed/'))
        text_field = self.browser.find_by_css('input[type="text"]')[0]
        submit_field = self.browser.find_by_css('input[type="submit"]')[0]
        text_field.fill(s)
        submit_field.click()

    def x_test_create(self):
        self.browser.find_by_css('.facebook-login-btn')[0].click()
        self.login_to_facebook()
        self.tweet('abcdefghijklmnopqrstuvwxyz')
        self.browser.visit(self.url('/Tweet_Feed/'))
        self.assertTrue(self.browser.is_text_present('abcdefghijklmnopqrstuvwxyz'))

    def test_edit(self):
        self.browser.find_by_css('.facebook-login-btn')[0].click()
        self.login_to_facebook()
        self.tweet('abcdefghijklmnopqrstuvwxyz')
        self.browser.visit(self.url('/Tweet_Feed/'))
        self.assertTrue(self.browser.is_text_present('abcdefghijklmnopqrstuvwxyz'))
        # TODO ADD MORE STUFF time.sleep(500)

if __name__ == "__main__":
    suite = unittest.TestLoader().loadTestsFromTestCase(TestCreateSimpleList)
    unittest.TextTestRunner(verbosity=2).run(suite)
