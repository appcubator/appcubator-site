from settings.common import *

DEBUG = True
TEMPLATE_DEBUG = DEBUG
PRODUCTION = False
STAGING = False

print "in dev.py"
ADMINS = (
    # ('Your Name', 'your_email@example.com'),
)

MANAGERS = ADMINS

import os.path
PROJECT_ROOT_PATH = os.path.join(os.path.dirname(__file__), "..")

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.sqlite3', # Add 'postgresql_psycopg2', 'mysql', 'sqlite3' or 'oracle'.
        'NAME': os.path.join(PROJECT_ROOT_PATH, 'tempdb'),
    }
}
