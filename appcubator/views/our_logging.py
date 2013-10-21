from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_POST
from django.utils import simplejson
from django.views.decorators.csrf import csrf_exempt

from appcubator.models import LogAnything

import requests

def JSONResponse(serializable_obj, **kwargs):
    """Just a convenience function, in the middle of horrible code"""
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)

@require_POST
@login_required
@csrf_exempt
def log_anything(request):
    key = request.POST['__key']
    data = request.POST.get('__data', '(No Data)')
    app_id = request.POST.get('__app_id', None)
    user_id = request.user.id
    # data = { k:v for k,v in request.POST.items() if not k.startswith('__') }
    la = LogAnything(app_id=app_id, user_id=user_id, name=key, data=data)
    la.save()
    return HttpResponse("ok")

@require_POST
@login_required
@csrf_exempt
def log_feedback(request):
    user = request.user.first_name
    user_id = request.user.id
    like = request.POST['like']
    dislike = request.POST['dislike']
    features = request.POST['features']
    app_id = request.POST.get('__app_id', None)

    message =  user + " says.\n\n Like: \n" + like + \
        "\n\n Dislike: \n" + dislike + "\n\n Feature request: \n" + features
    data = {}
    data['message'] = message

    la = LogAnything(app_id=app_id, user_id=user_id, name="posted feedback", data=data)
    la.save()

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
