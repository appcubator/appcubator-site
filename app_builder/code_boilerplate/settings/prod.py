import os
import os.path

DEBUG = False
TEMPLATE_DEBUG = DEBUG

from common import *

ADMINS = (
    ('Appcubator', 'team@appcubator.com'),
)

MANAGERS = ADMINS

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': "deployment##DEPLOYMENTID##", # preprocessed by deployment server
        'HOST': "127.0.0.1",
        'USER': "appcubator",
        'PASSWORD': os.environ['ADB_PASSWORD'],
    }
}

# A sample logging configuration. The only tangible logging
# performed by this configuration is to send an email to
# the site admins on every HTTP 500 error when DEBUG=False.
# See http://docs.djangoproject.com/en/dev/topics/logging for
# more details on how to customize your logging configuration.
LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'filters': {
        'require_debug_false': {
            '()': 'django.utils.log.RequireDebugFalse'
        }
    },
    'handlers': {
        'mail_admins': {
            'level': 'ERROR',
            'filters': ['require_debug_false'],
            'class': 'django.utils.log.AdminEmailHandler'
        }
    },
    'loggers': {
        'django.request': {
            'handlers': ['mail_admins'],
            'level': 'ERROR',
            'propagate': True,
        },
    }
}

ALLOWED_HOSTS = ['*']

# Simple SMTP
EMAIL_HOST = 'smtp.sendgrid.net'
EMAIL_PORT = 587
EMAIL_HOST_USER = os.environ["SENDGRID_USERNAME"]
EMAIL_HOST_PASSWORD = os.environ["SENDGRID_PASSWORD"]
EMAIL_USE_TLS = False
DEFAULT_FROM_EMAIL = 'team@appcubator.com'
