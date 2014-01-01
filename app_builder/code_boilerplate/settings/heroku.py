from dev import *

"""
Heroku environment is still a dev environment.
"""

# Parse database configuration from $DATABASE_URL
import dj_database_url
DATABASES = {
    'default': dj_database_url.config()
}
