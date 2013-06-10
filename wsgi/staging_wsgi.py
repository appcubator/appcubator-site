import os
import djcelery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.staging")
djcelery.setup_loader()

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
