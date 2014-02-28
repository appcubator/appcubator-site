from appcubator.deploy.deis_deploy import update_orphan_cache
import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "settings.common")
update_orphan_cache()
