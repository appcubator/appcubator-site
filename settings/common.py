import os
# Local time zone for this installation. Choices can be found here:
# http://en.wikipedia.org/wiki/List_of_tz_zones_by_name
# although not all choices may be available on all operating systems.
# In a Windows environment this must be set to your system time zone.
TIME_ZONE = 'America/Chicago'

# Language code for this installation. All choices can be found here:
# http://www.i18nguy.com/unicode/language-identifiers.html
LANGUAGE_CODE = 'en-us'

SITE_ID = 1

# If you set this to False, Django will make some optimizations so as not
# to load the internationalization machinery.
USE_I18N = True

# If you set this to False, Django will not format dates, numbers and
# calendars according to the current locale.
USE_L10N = True

# If you set this to False, Django will not use timezone-aware datetimes.
USE_TZ = True

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/media/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = ''

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = ''

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'

# Additional locations of static files
STATICFILES_DIRS = (
    # Put strings here, like "/home/html/static" or "C:/www/django/static".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

# List of finder classes that know how to find static files in
# various locations.
STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'less.finders.LessFinder',
#    'django.contrib.staticfiles.finders.DefaultStorageFinder',
)

# Make this unique, and don't share it with anybody.
SECRET_KEY = '(kx8m9$ts@foen+2h(tv$q^k(k@z@)bl+wq*4r67srq$&amp;hjt$^'

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
#    'payments.middleware.ActiveSubscriptionMiddleware',
    # Uncomment the next line for simple clickjacking protection:
    # 'django.middleware.clickjacking.XFrameOptionsMiddleware',
)

ROOT_URLCONF = 'appcubator.urls'

# Python dotted path to the WSGI application used by Django's runserver.
WSGI_APPLICATION = 'wsgi.application'

TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
)

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
DOCUMENTATION_SEARCH_DIR = os.path.join(BASE_DIR, 'appcubator/templates/documentation/html/')

TEMPLATE_CONTEXT_PROCESSORS = (
    "django.contrib.auth.context_processors.auth",
    "django.core.context_processors.debug",
    "django.core.context_processors.i18n",
    "django.core.context_processors.media",
    "django.core.context_processors.static",
    "django.core.context_processors.tz",
    "django.contrib.messages.context_processors.messages",
    "django.core.context_processors.csrf",
    "appcubator.context_processors.list_of_users_apps.list_of_users_apps",
    "appcubator.context_processors.list_of_users_apps.debug",
    "appcubator.context_processors.list_of_users_apps.static_cache_busting",
    "appcubator.payments.views.stripe_context",
)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'appcubator',
    'south',
    'djcelery',
    'kombu.transport.django',
    'less',
    'registration',
    'django_forms_bootstrap',
    'payments',
    # Uncomment the next line to enable the admin:
    # 'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

# See http://docs.djangoproject.com/en/dev/topics/logging
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': '%(levelname)s %(asctime)s %(module)s %(process)d %(thread)d %(message)s'
        },
        'simple': {
            'format': '%(levelname)s %(message)s'
        },
    },
    'filters': {
      'require_debug_false': {
        '()': 'django.utils.log.RequireDebugFalse',
      }
    },
    'handlers': {
        'null': {
            'level':'DEBUG',
            'class':'django.utils.log.NullHandler',
        },
        'console':{
            'level':'DEBUG',
            'class':'logging.StreamHandler',
            'formatter': 'simple'
        },
        'mail_admins': {
            'level': 'ERROR',
            'class': 'django.utils.log.AdminEmailHandler',
            'filters': ['require_debug_false'],
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins', 'console'],
            'level': 'DEBUG',
            'propagate': False,
        },
        'app_builder': {
            'handlers': ['console'],
            'level': 'ERROR'
        },
        'appcubator': {
            'handlers': ['console'],
            'level': 'DEBUG'
        },
    }
}

# Stripe Payments based key
#STRIPE_PUBLIC_KEY = os.environ.get("STRIPE_PUBLIC_KEY", "pk_test_qbJZ9hMePgdpdZUrkKTskzgz")
#STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_test_GhzvfBePNCkvC6j23UtZkmTi")
STRIPE_PUBLIC_KEY = os.environ.get("STRIPE_PUBLIC_KEY", "pk_live_fY9VBkCmjBQLk621M0ya73gL")
STRIPE_SECRET_KEY = os.environ.get("STRIPE_SECRET_KEY", "sk_live_QcJadrTVAXeC3DrotELf02KJ")


PAYMENTS_PLANS = {
    "monthly": {
        "stripe_plan_id": "pro-monthly",
        "name": "Production ($35/month)",
        "description": "The monthly subscription plan when your application is ready for production",
        "price": 35,
        "currency": "usd",
        "interval": "month"
    },
    "free": {
        "stripe_plan_id": "pro-monthly-free",
        "name": "Starter (Free)",
        "description": "The free subscription plan to play around with your application(s)",
        "price": 0,
        "currency": "usd",
        "interval": "month"
    }
}
# SUBSCRIPTION_REQUIRED_EXCEPTION_URLS = ['/']
# SUBSCRIPTION_REQUIRED_REDIRECT='/'

# End keys

# Registration window
ACCOUNT_ACTIVATION_DAYS = 28
# Invite based information
INVITATIONS_PER_USER = 5
ACCOUNT_INVITATION_DAYS = 120

LOGOUT_URL="/"
LOGIN_URL="/login/"

# Simple SMTP
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_HOST_USER = "maverickn"
EMAIL_HOST_PASSWORD = "obscurepassword321"
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = 'team@appcubator.com'

DEPLOYMENT_HOSTNAME = 'deployment.staging.appcubator.com'

import os, os.path
import re
static_version_file_path = os.path.join(os.path.dirname(__file__), 'STATIC_VERSION')
with open(static_version_file_path) as bro:
    CACHE_BUSTING_STRING = re.sub(r'[^0-9A-Za-z_\-]', '', bro.read().split('\n')[0].strip())

CACHES = {
    'default': {
        'BACKEND': 'django.core.cache.backends.locmem.LocMemCache'
    }
}
AUTHENTICATION_BACKENDS = (
    'appcubator.utils.EmailOrUsernameModelBackend',
    'social_auth.backends.facebook.FacebookBackend',
    'social_auth.backends.twitter.TwitterBackend',
    'social_auth.backends.contrib.linkedin.LinkedinBackend',
    'django.contrib.auth.backends.ModelBackend',
)
