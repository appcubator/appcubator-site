def list_of_users_apps(request):
  if request.user.is_authenticated():
    return { 'users_apps' : request.user.apps.all() }
  else:
    return {}

def debug(request):
  from django.conf import settings
  return {'DEBUG':settings.DEBUG}
