import time
import re
import unittest
from app_builder.tests.utils import SplinterTestCase
import os
import simplejson

class TestSup(SplinterTestCase):

    json_file_name = re.sub(r'_splinter\.pyc?', '.json', __file__)
    with open(json_file_name) as f:
        APP_STATE = simplejson.load(f)

    def setUp(self):
        super(TestSup, self).setUp()
        self.browser.visit(self.url('/'))

    @property
    def signup_role_one(self):
        fb_buttons = self.browser.find_by_css('.facebook-login-btn')
        return fb_buttons[0]

    @property
    def signup_role_two(self):
        fb_buttons = self.browser.find_by_css('.facebook-login-btn')
        return fb_buttons[1]

    @property
    def signup_role_three(self):
        fb_buttons = self.browser.find_by_css('.facebook-login-btn')
        return fb_buttons[2]

    @property
    def login(self):
        fb_buttons = self.browser.find_by_css('.facebook-login-btn')
        return fb_buttons[3]

    def login_to_facebook(self):
        assert 'facebook.com' in self.browser.url
        email_input = self.browser.find_by_id('email')[0]
        email_input.fill(os.environ['FB_USERNAME'])
        passwd_input = self.browser.find_by_id('pass')[0]
        passwd_input.fill(os.environ['FB_PASSWD'])
        self.browser.find_by_name('login')[0].click()

    def test_signup_button_creates_and_redirects_based_on_role_one(self):
        self.signup_role_one.click()
        self.login_to_facebook()
        self.assertIn('r3', self.browser.url)

    def test_signup_button_creates_and_redirects_based_on_role_two(self):
        self.signup_role_two.click()
        self.login_to_facebook()
        self.assertIn('r2', self.browser.url)

    def test_signup_button_creates_and_redirects_based_on_role_three(self):
        self.signup_role_three.click()
        self.login_to_facebook()
        self.assertIn('r1', self.browser.url)

    def test_signup_twice_not_allowed(self):
        self.signup_role_three.click()
        self.login_to_facebook()
        self.browser.visit(self.url('/'))
        self.signup_role_three.click()
        self.assertEqual('/#_=_', self.route(self.browser.url))

    def test_login_and_logout_after_signup_works_properly_three(self):
        self.signup_role_three.click()
        self.login_to_facebook()
        self.browser.visit(self.url('/'))
        self.login.click()
        self.assertIn('r3', self.route(self.browser.url))

    def test_login_and_logout_after_signup_works_properly_two(self):
        self.signup_role_two.click()
        self.login_to_facebook()
        self.browser.visit(self.url('/'))
        self.login.click()
        self.assertIn('r2', self.route(self.browser.url))

    def test_login_and_logout_after_signup_works_properly_one(self):
        self.signup_role_one.click()
        self.login_to_facebook()
        self.browser.visit(self.url('/'))
        self.login.click()
        self.assertIn('r1', self.route(self.browser.url))

    def test_cant_login_before_signup(self):
        self.login.click()
        self.login_to_facebook()
        self.assertEqual('/#_=_', self.route(self.browser.url))
