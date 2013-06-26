from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from models import RouteLog, TutorialLog
from email.sendgrid_email import send_email
from models import DomainRegistration

from app_builder.analyzer import App as AnalyzedApp
from app_builder.utils import get_xl_data, add_xl_data, get_model_data

import requests
import traceback
import datetime

def JSONResponse(serializable_obj, **kwargs):
    """Just a convenience function, in the middle of horrible code"""
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)


@require_POST
@login_required
@csrf_exempt
def log_route(request, app_id):
    user_id = request.user.id
    page_name = request.POST['page_name']
    app_id = long(app_id)
    log = RouteLog(user_id=user_id, page_name=page_name, app_id=app_id)
    log.full_clean()
    log.save()
    return HttpResponse("saved route")


@require_POST
@login_required
def log_slide(request):
    title = request.POST['title']
    directory = request.POST['directory']

    if title is not None or directory is not None:
        TutorialLog.create_log(request.user, title, directory)

    d = {}
    d['percentage'] = TutorialLog.get_percentage(request.user)
    d['feedback'] = TutorialLog.is_donewithfeedback(request.user)

    return JSONResponse(d)


@require_POST
@login_required
def log_feedback(request):
    user = request.user.first_name
    like = request.POST['like']
    dislike = request.POST['dislike']
    features = request.POST['features']

    message =  user + " says.\n\n Like: \n" + like + \
        "\n\n Dislike: \n" + dislike + "\n\n Feature request: \n" + features

    TutorialLog.create_feedbacklog(request.user, message)

    requests.post(
        "https://api.mailgun.net/v2/v1factory.mailgun.org/messages",
        auth=("api", "key-8iina6flmh4rtfyeh8kj5ai1maiddha8"),
        data={
            "from": "v1Factory Bot <postmaster@v1factory.mailgun.org>",
            "to": "team@appcubator.com",
            "subject": "Someone has some feedback!",
            "text": message
        }
    )

    return JSONResponse("ok")
