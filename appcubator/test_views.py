from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect,render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import forms as auth_forms, authenticate, login
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.utils import simplejson

from django import forms
from django.utils import simplejson
from copy import deepcopy
import time
from models import App

from appcubator.email.sendgrid_email import send_email

import sys
import requests
import shlex
import subprocess
import os


def test_editor(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	finally:
		#delete all apps for user
		App.objects.filter(owner=test_user).delete()
		#create new test app
		app_name = "!@TEST__APP@! %s" % time.time()
		test_app = App(name=app_name, owner=test_user)
		test_app.set_test_state()
		test_app.save()
		test_data = {
			'app': test_app,
			'app_id': long(test_app.id),
			'user': test_user,
			'themes': [],
			'mobile_themes': [],
			'statics': []
		}
		return render(request, 'tests/editor-SpecRunner.html', test_data)

def test_tables(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	finally:
		#delete all apps for user
		App.objects.filter(owner=test_user).delete()
		#create new test app
		app_name = "!@TEST__APP@! %s" % time.time()
		test_app = App(name=app_name, owner=test_user)
		test_app.set_test_state()
		test_app.save()
		test_data = {
			'app': test_app,
			'app_id': long(test_app.id),
			'user': test_user,
			'themes': [],
			'mobile_themes': [],
			'statics': []
		}
		return render(request, 'tests/tables-SpecRunner.html', test_data)

def test_formeditor(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	finally:
		#delete all apps for user
		App.objects.filter(owner=test_user).delete()
		#create new test app
		app_name = "!@TEST__APP@! %s" % time.time()
		test_app = App(name=app_name, owner=test_user)
		test_app.set_test_state()
		test_app.save()
		test_data = {
			'app': test_app,
			'app_id': long(test_app.id),
			'user': test_user,
			'themes': [],
			'mobile_themes': [],
			'statics': []
		}
		return render(request, 'tests/formeditor-SpecRunner.html', test_data)


def test_thirdpartyforms(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	finally:
		#delete all apps for user
		App.objects.filter(owner=test_user).delete()
		#create new test app
		app_name = "!@TEST__APP@! %s" % time.time()
		test_app = App(name=app_name, owner=test_user)
		test_app.set_test_state()
		test_app.save()
		test_data = {
			'app': test_app,
			'app_id': long(test_app.id),
			'user': test_user,
			'themes': [],
			'mobile_themes': [],
			'statics': []
		}
		return render(request, 'tests/thirdpartyformeditors.html', test_data)


def test_data(request):
    return render(request, 'tests/data-SpecRunner.html', {})


def test_router(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	finally:
		#delete all apps for user
		App.objects.filter(owner=test_user).delete()
		#create new test app
		app_name = "!@TEST__APP@! %s" % time.time()
		test_app = App(name=app_name, owner=test_user)
		test_app.set_test_state()
		test_app.save()
		test_data = {
			'app': test_app,
			'app_id': long(test_app.id),
			'user': test_user,
			'themes': [],
			'mobile_themes': [],
			'statics': []
		}
		return render(request, 'tests/router-SpecRunner.html', test_data)


@csrf_exempt
def run_front_end_tests(request, domain="staging.appcubator.com"):

    #TODO(nkhadke): Pull repo first
    json = simplejson.loads(request.POST['payload'])
    email = json['commits'][0]['author']['email']

    p = subprocess.Popen(shlex.split("/bin/bash run_tests.sh %s" % domain) ,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.join(os.path.dirname(__file__), '..'))
    out, err = p.communicate()
    retcode = p.wait()

    from_email = "jeffdean@appcubator.com"
    to_email = email
    html = "Return Code: %s<br><br>Standard Out:<br>%s<br><br>Standard Error:<br>%s<br><br>" %(retcode, out, err)
    send_email(from_email, to_email, "Front End Tests", "", html)

    return HttpResponse("ok")