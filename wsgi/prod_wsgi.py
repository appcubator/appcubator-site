import os
import djcelery

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.prod")
djcelery.setup_loader()

from django.core.wsgi import get_wsgi_application
application = get_wsgi_application()
