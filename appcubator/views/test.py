from django.http import HttpResponse
from django.views.decorators.http import require_POST
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import render
from django.contrib.auth.models import User

import time
from appcubator.models import App

from appcubator.email.sendgrid_email import send_email

import simplejson

import shlex
import subprocess
import os


def run_with_test_app(f):
    def ret_fun(request, *args, **kwargs):
        test_user = User.objects.create_user("!@TEST__USER@!", "!@TEST__USER@!@gmail.com", "!@TEST__USER@!")
        try:
            #create new test app
            app_name = "!@TEST__APP@! %s" % time.time()
            test_app = App(name=app_name, owner=test_user)
            test_app.set_test_state()
            test_app.save()
            # call the wrapped function with the test app
            r = f(request, test_app, *args, **kwargs)
        finally:
            test_user.delete()
        return r
    return ret_fun

@run_with_test_app
def test_editor(request, test_app):
    test_data = {
        'app': test_app,
        'app_id': long(test_app.id),
        'user': test_app.owner,
        'themes': [],
        'mobile_themes': [],
        'statics': []
    }
    return render(request, 'tests/editor-SpecRunner.html', test_data)

@run_with_test_app
def test_tables(request, test_app):
    test_data = {
        'app': test_app,
        'app_id': long(test_app.id),
        'user': test_app.owner,
        'themes': [],
        'mobile_themes': [],
        'statics': []
    }
    return render(request, 'tests/tables-SpecRunner.html', test_data)

@run_with_test_app
def test_formeditor(request, test_app):
    test_data = {
        'app': test_app,
        'app_id': long(test_app.id),
        'user': test_app.owner,
        'themes': [],
        'mobile_themes': [],
        'statics': []
    }
    return render(request, 'tests/formeditor-SpecRunner.html', test_data)

@run_with_test_app
def test_thirdpartyforms(request, test_app):
    test_data = {
        'app': test_app,
        'app_id': long(test_app.id),
        'user': test_app.owner,
        'themes': [],
        'mobile_themes': [],
        'statics': []
    }
    return render(request, 'tests/thirdpartyformeditors.html', test_data)


def test_data(request):
    return render(request, 'tests/data-SpecRunner.html', {})


@run_with_test_app
def test_router(request, test_app):
    test_data = {
        'app': test_app,
        'app_id': long(test_app.id),
        'user': test_app.owner,
        'themes': [],
        'mobile_themes': [],
        'statics': []
    }
    return render(request, 'tests/router-SpecRunner.html', test_data)


@csrf_exempt
@require_POST
def run_front_end_tests(request, domain="staging.appcubator.com", branch="staging"):

    p = subprocess.Popen(shlex.split("git pull origin %s" % branch) ,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.join(os.path.dirname(__file__), '..'))
    out, err = p.communicate()
    retcode = p.wait()
    html = "<b>Git Pull Information</b><br><br>Return Code: %s<br><br>Standard Out:<br>%s<br><br>Standard Error:<br>%s<br><br>" %(retcode, out, err)

    json = simplejson.loads(request.POST['payload'])
    email = json['commits'][0]['author']['email']

    p = subprocess.Popen(shlex.split("/bin/bash run_tests.sh %s" % domain) ,
        stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=os.path.join(os.path.dirname(__file__), '..'))
    out, err = p.communicate()
    retcode = p.wait()

    from_email = "jeffdean@appcubator.com"
    to_email = email
    html += "<b>Test Information</b><br><br>Return Code: %s<br><br>Standard Out:<br>%s<br><br>Standard Error:<br>%s<br><br>" %(retcode, out, err)
    send_email(from_email, to_email, "Front End Tests", "", html)

    return HttpResponse("ok")
