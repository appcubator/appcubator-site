from django.http import HttpResponse, Http404

from django.shortcuts import redirect, render, get_object_or_404
from django.core.urlresolvers import reverse
from django.core.exceptions import ValidationError
from django.template import loader, Context

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from django.contrib import messages

from django.forms import ModelForm

import re
import requests
import nltk
import simplejson

import os, os.path
join = os.path.join

from django.conf import settings


def JsonResponse(serializable_obj, **kwargs):
    """Just a convenience function, in the middle of horrible code"""
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)


@require_GET
@login_required
def tutorials_page(request, page_name="tutorial"):

    return render(request, 'app-tutorials.html')


@require_GET
@login_required
def tutorial(request, step_id, page_name="tutorial"):
    td = TempDeployment.find_or_create_temp_deployment(request)
    td.deploy()
    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]
    page_context = {
        'app' : { 'id': 0},
        'default_state': get_default_app_state(),
        'title': 'My First App',
        'default_mobile_uie_state': get_default_mobile_uie_state(),
        'default_uie_state': get_default_uie_state(),
        'themes': simplejson.dumps(list(themes)),
        'mobile_themes': simplejson.dumps(list(mobile_themes)),
        'statics': simplejson.dumps([]),
    }
    page_context["title"] = "Demo Editor"

    return render(request, 'app-show-tutorial.html', page_context)
