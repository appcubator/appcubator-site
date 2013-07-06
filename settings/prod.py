# THESE ARE THE PRODUCTION SETTINGS FOR THE APP RUNNING IN EC2


from settings.common import *
import os

DEBUG = False
TEMPLATE_DEBUG = DEBUG
PRODUCTION = True
STAGING = False


ADMINS = (
    ('Karan Sikka', 'karan@appcubator.com'),
    ('Nikhil Khadke', 'nikhil@appcubator.com'),
    ('Ilter Canberk', 'ilter@appcubator.com'),
    ('Kedar Amladi', 'kedar@appcubator.com'),
    ('Sagar Rambhia', 'sagar@appcubator.com'),
)

MANAGERS = ADMINS

import os.path
PROJECT_ROOT_PATH = os.path.join(os.path.dirname(__file__), "..")

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
WSGI_APPLICATION = 'wsgi.prod_wsgi.application'
DEPLOYMENT_HOSTNAME = 'deployment.appcubator.com'
