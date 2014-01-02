import os, os.path
import re

DEBUG=True
TEMPLATE_DEBUG=DEBUG

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))
PROJECT_ROOT_PATH = BASE_DIR

ADMINS = (
    ('Karan Sikka', 'karan@appcubator.com'),
    ('Ilter Canberk', 'ilter@appcubator.com'),
)

MANAGERS = ADMINS

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
MEDIA_ROOT = os.path.join(BASE_DIR, "collected_media")

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash.
# Examples: "http://media.lawrence.com/media/", "http://example.com/media/"
MEDIA_URL = '/media/'

# Absolute path to the directory static files should be collected to.
# Don't put anything in this directory yourself; store your static files
# in apps' "static/" subdirectories and in STATICFILES_DIRS.
# Example: "/home/media/media.lawrence.com/static/"
STATIC_ROOT = os.path.join(BASE_DIR + "appcubator/dist_static")

# URL prefix for static files.
# Example: "http://media.lawrence.com/static/"
STATIC_URL = '/static/'
ADMIN_MEDIA_PREFIX = '/static/admin/'

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
SECRET_KEY = os.environ['SECRET_KEY']

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',


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
    "appcubator.our_payments.views.stripe_context",

    'django.core.context_processors.request',

)

INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.staticfiles',
    'django.contrib.admin',
    'django.contrib.humanize',
    'django.contrib.sitemaps',
    'django.contrib.messages',
    'appcubator',
    'appcubator.plugins',
    'appcubator.admin',
    'appcubator.themes',
    'website',
    'tutorials',
    'south',
    'less',
    'registration',
    'django_forms_bootstrap',
    'payments',
    'threadedcomments',
    'django.contrib.comments',

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


COMMENTS_APP = 'threadedcomments'

# Registration window
ACCOUNT_ACTIVATION_DAYS = 28
# Invite based information
INVITATIONS_PER_USER = 5
ACCOUNT_INVITATION_DAYS = 120

LOGOUT_URL="/"
LOGIN_URL="/login/"

# Simple SMTP
EMAIL_HOST = os.environ['EMAIL_HOST']
EMAIL_PORT = os.environ['EMAIL_PORT']
EMAIL_HOST_USER = os.environ['EMAIL_HOST_USER']
EMAIL_HOST_PASSWORD = os.environ['EMAIL_HOST_PASSWORD']
EMAIL_PORT = os.environ['EMAIL_PORT']
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = 'team@appcubator.com'


static_version_file_path = os.path.join(os.path.dirname(__file__), 'STATIC_VERSION')
with open(static_version_file_path) as bro:
    CACHE_BUSTING_STRING = re.sub(r'[^0-9A-Za-z_\-]', '', bro.read().split('\n')[0].strip())

AUTHENTICATION_BACKENDS = (
    'appcubator.utils.EmailOrUsernameModelBackend',
    'social_auth.backends.facebook.FacebookBackend',
    'social_auth.backends.twitter.TwitterBackend',
    'social_auth.backends.contrib.linkedin.LinkedinBackend',
    'django.contrib.auth.backends.ModelBackend',
)


if 'DB_PASSWORD' in os.environ:
    DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.mysql',
           'HOST': os.environ['DB_HOST'],
           'PORT': os.environ['DB_PORT'],
           'NAME': os.environ['DB_NAME'],
           'USER': os.environ['DB_USERNAME'],
           'PASSWORD': os.environ['DB_PASSWORD'],
       }
    }
else:
    DATABASES = {
       'default': {
           'ENGINE': 'django.db.backends.sqlite3',
           'NAME': os.path.join(BASE_DIR, 'tempdb')
       }
    }

# Production/Live keys for Stripe
STRIPE_PUBLIC_KEY = os.environ["STRIPE_PUBLIC_KEY"]
STRIPE_SECRET_KEY = os.environ["STRIPE_SECRET_KEY"]

# deployer service
DEPLOYMENT_HOSTNAME = os.environ["DEPLOYMENT_HOSTNAME"]
# domain from which apps are available
DEPLOYMENT_DOMAIN = os.environ["DEPLOYMENT_DOMAIN"]
