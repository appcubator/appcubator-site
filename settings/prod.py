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
       'USER': 'appcubator',
       'PASSWORD': 'longisland3',
       'HOST': 'appcubatorsite.ccchupi0ycq8.us-east-1.rds.amazonaws.com',
       'PORT': 3306
   },
}

# Production/Live keys for Stripe
#STRIPE_PUBLIC_KEY = os.environ.get("STRIPE_PUBLIC_KEY", "pk_live_fY9VBkCmjBQLk621M0ya73gL")
#STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_live_QcJadrTVAXeC3DrotELf02KJ")

WSGI_APPLICATION = 'wsgi.prod_wsgi.application'
DEPLOYMENT_HOSTNAME = 'deployment.appcubator.com'
