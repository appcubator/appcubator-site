# THESE ARE THE PRODUCTION SETTINGS FOR THE APP RUNNING IN EC2


from settings.common import *
import os

DEBUG = False
TEMPLATE_DEBUG = DEBUG
PRODUCTION = True
STAGING = False

ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

import os.path
PROJECT_ROOT_PATH = os.path.join(os.path.dirname(__file__), "..")

"""
'default': {
    'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
    'NAME': os.path.join(PROJECT_ROOT_PATH, 'tempdb'),
},"""
DATABASES = {
   'default': {
       'ENGINE': 'django.db.backends.mysql',
       'NAME': 'v1factory',
       'USER': 'root',
       'PASSWORD': 'obscurepassword321',
       'HOST': '127.0.0.1',
       'PORT': 3306
   }
}
