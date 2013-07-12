from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.urlresolvers import reverse

from models import App, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts, AppstateSnapshot, RouteLog, Customer, ExtraUserData
from email.sendgrid_email import send_email
from models import DomainRegistration
from models import get_default_uie_state, get_default_mobile_uie_state
from models import get_default_app_state, get_default_theme_state

import app_builder.analyzer as analyzer
from app_builder.analyzer import App as AnalyzedApp
from app_builder.utils import get_xl_data, add_xl_data, get_model_data

import requests
import traceback
import datetime
import shlex
import subprocess
import os
from datetime import datetime

@login_required
def admin_home(request):
    page_context = {}
    return render(request, 'admin/home.html', page_context)

@login_required
def admin_customers(request):
    page_context = {}
    page_context["customers"] = Customer.objects.all()
    return render(request, 'admin/customers.html', page_context)

@login_required
def admin_users(request):
    page_context = {}
    page_context["users"] = ExtraUserData.objects.all()
    return render(request, 'admin/users.html', page_context)

@login_required
def admin_user(request, user_id):
    user_id = long(user_id)
    user = get_object_or_404(ExtraUserData, id=user_id)
    logs = RouteLog.objects.filter(user_id=user_id)
    print logs[1].opened_on
    print logs[1].app_id
    print logs[1].page_name
    page_context = {}
    page_context["user"] = user
    page_context["userlogs"] = logs
    return render(request, 'admin/user.html', page_context)

@login_required
def admin_apps(request):
    page_context = {}
    page_context["apps"] = App.objects.all()
    return render(request, 'admin/apps.html', page_context)

@login_required
def admin_app(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id, owner=request.user)
    page_context = {}
    page_context["app"] = app
    return render(request, 'admin/app.html', page_context)

@login_required
def admin_feedback(request):
    page_context = {}
    #page_context["feedback"] = App.objects.all()
    return render(request, 'admin/feedback.html', page_context)
