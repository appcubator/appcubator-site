"""TODO

1. view functions
2. supporting model functions
3. create basic deployer interface

"""
import re
import datetime
from django.http import HttpResponse, Http404
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from models import Deployment
from django.views.decorators.csrf import csrf_exempt
from tasks import push
import github_actions
import sys
import subprocess
import logging
print __name__
logger = logging.getLogger(__name__)

# for what it's worth
import threading
threading._DummyThread._Thread__stop = lambda x: 42

class ProJSON(simplejson.JSONEncoder):
  """It's about time we handled datetime"""
  def default(self, obj):
    if isinstance(obj, datetime.datetime):
      return obj.isoformat()
    else:
      return super(DateTimeJSONEncoder, self).default(obj)

@require_GET
#@login_required
def list_deployments(request):
  d = Deployment.objects.all()
  return HttpResponse(simplejson.dumps(list(d.values()), cls=ProJSON), mimetype="application/json")

def is_valid_subdomain(subdomain):
  return len(subdomain) >= 2 and len(subdomain) <= 20 and re.match(r'[a-z0-9][a-z0-9\-]*[a-z0-9]$', subdomain)

@require_GET
def available_check(request):
  subdomain = request.GET['subdomain']
  assert(is_valid_subdomain(subdomain))
  if Deployment.objects.filter(subdomain=subdomain).exists():
    return HttpResponse("0")
  else:
    return HttpResponse("1")

@require_POST
@csrf_exempt
#@login_required
def deploy_code(request):
  s = request.POST['subdomain']
  u_name = request.POST['u_name']
  app_json = request.POST['app_json']
  css = request.POST['css']
  d_user = request.POST['d_user']
  logger.debug("Trying to get deployment object.")
  try:
    d = Deployment.objects.get(u_name=u_name)
  except Deployment.DoesNotExist:
    logger.debug("Not found - creating one now.")
    d = Deployment.create(s, u_name=u_name, app_state=simplejson.loads(app_json))
    d.initialize()
    try: # DEBUG
      github_actions.create(u_name, d.app_dir)
    except:
      print "you foollllll"
  else:
    logger.debug("Found deployment.")
    d.subdomain = s
    d.update_app_state(simplejson.loads(app_json))
  d.update_css(css)
  d.full_clean()
  logger.debug("Attempting to deploy.")
  msgs = d.deploy(simplejson.loads(d_user))
  # Async call via celery
  logger.debug("Git push delegated to celery.")
  push.delay(u_name, d.app_dir)
  logger.debug("Save deployment object.")
  d.save()
  logger.debug("Reload server.")
  ret_code = subprocess.call(["sudo", "/var/www/v1factory/reload_apache.sh"])
  return HttpResponse(simplejson.dumps(msgs), mimetype="application/json")

@require_POST
@csrf_exempt
#@login_required
def delete_deployment(request):
  u_name = request.POST['u_name']

  try:
    d = Deployment.objects.get(u_name=u_name)
  except Deployment.DoesNotExist:
    print "couldn't find deployment... ruh roh. u_name was: ", u_name
    raise Http404

  d.delete()
  return HttpResponse("ok")
