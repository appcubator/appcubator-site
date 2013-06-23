from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect,render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import forms as auth_forms, authenticate, login
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django import forms
from django.utils import simplejson
from copy import deepcopy
import time
from models import App

import requests
import re


def test_editor(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	else:
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

def test_formeditor(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	else:
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

def test_data(request):
    return render(request, 'tests/data-SpecRunner.html', {})

def test_router(request):
	#find/create test user
	try:
		test_user = User.objects.get(username="!@TEST__USER@!")
	except User.DoesNotExist:
		test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
	else:
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
