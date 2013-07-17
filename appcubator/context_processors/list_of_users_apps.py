def list_of_users_apps(request):
  if request.user.is_authenticated():
    return { 'users_apps' : request.user.apps.all() }
  else:
    return {}

def debug(request):
  from django.conf import settings
  return {'DEBUG':settings.DEBUG}

def static_cache_busting(request):
  from django.conf import settings
  return {'STATIC_VERSION':settings.CACHE_BUSTING_STRING}
