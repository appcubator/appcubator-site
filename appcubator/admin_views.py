from django.http import HttpResponse
from django.contrib.auth.decorators import login_required, user_passes_test
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
import json
from django.shortcuts import redirect, render, render_to_response, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.contrib.auth.models import User
from models import App, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts, AppstateSnapshot, LogAnything, Customer, ExtraUserData
from django.db.models import Avg, Count
from email.sendgrid_email import send_email
from models import DomainRegistration
from models import get_default_uie_state, get_default_mobile_uie_state
from models import get_default_app_state, get_default_theme_state

import requests
import traceback
import datetime
import shlex
import subprocess
import os
from datetime import datetime, timedelta
from django.utils import timezone

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_home(request):
    page_context = {}

    # active users
    page_context["users_today"] = recent_users(long_ago=timedelta(days=1))
    page_context["users_last_week"] = recent_users(long_ago=timedelta(days=1))
    page_context["users_last_month"] = recent_users(long_ago=timedelta(days=30))

    # Top 10 users with most page visits
    page_context["most_active_users"] = logs_per_user()

    # deployed apps stats
    page_context["avg_deployment_time"] = avg_deployment_time()
    page_context["num_deployed_apps"] = num_deployed_apps()

    return render(request, 'admin/home.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_customers(request):
    page_context = {}
    page_context["customers"] = Customer.objects.all()
    return render(request, 'admin/customers.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_users(request):
    page_context = {}
    page_context["users"] = ExtraUserData.objects.all()
    return render(request, 'admin/users.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_user(request, user_id):
    user_id = long(user_id)
    user = get_object_or_404(ExtraUserData, id=user_id)
    apps = App.objects.filter(owner=user_id)
    logs = LogAnything.objects.filter(user_id=user_id)
    apps = App.objects.filter(owner=user_id)
    page_context = {}
    page_context["user"] = user
    page_context["apps"] = apps
    page_context["userlogs"] = logs
    page_context["apps"] = apps
    return render(request, 'admin/user.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_apps(request):
    page_context = {}
    page_context["apps"] = App.objects.all()
    return render(request, 'admin/apps.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_app(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    page_context = {}
    page_context["app"] = app
    page_context["app_id"] = app_id
    return render(request, 'admin/app.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_feedback(request):
    page_context = {}
    page_context["feedback"] = LogAnything.objects.filter(name='posted feedback')
    return render(request, 'admin/feedback.html', page_context)

# active users this past week
def recent_users(long_ago=timedelta(days=1)):
    today = timezone.now().date()
    time_ago = today - long_ago
    logs = LogAnything.objects\
        .filter(timestamp__gte=time_ago, name="visited page")\
        .values('user_id').distinct()\
        .annotate(num_logs=Count('user_id'))\
        .order_by('-num_logs')
    for log in logs:
        user_id = log["user_id"]
        log["user"] = ExtraUserData.objects.get(pk=user_id)
        log["name"] = log["user"].user.first_name + " " + log["user"].user.last_name
        log["num_apps"] = log["user"].user.apps.count()
    return logs

# Top 10 users with most page visits
def logs_per_user():
    page_visits = LogAnything.objects.filter(name='visited page')
    logs_per_user = page_visits.values('user_id').annotate(num_logs=Count('user_id'))
    if len(logs_per_user) > 10:
        logs_per_user = logs_per_user[:10]
    for x in logs_per_user:
        user_id = x["user_id"]
        x["user"] = ExtraUserData.objects.get(pk=user_id)
        x["num_apps"] = x["user"].user.apps.count()
    return logs_per_user

def avg_deployment_time():
    deploy_logs_data = [log.data_json for log in LogAnything.objects.filter(name="deployed app")]
    deploy_times = []
    for d in deploy_logs_data:
        if "deploy_time" in d:
            number = float(d["deploy_time"].replace(" seconds", ""))
            deploy_times.append(number)
    if(len(deploy_times)):
        return sum(deploy_times) / len(deploy_times)
    else:
        return 0.0

# the number of unique apps deployed within the requested time frame
def deployed_apps(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return LogAnything.objects\
        .filter(timestamp__gte=min, timestamp__lte=max, name="deployed app")\
        .distinct('app_id').count()

# the number of page views within the requested time frame
def pageviews(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return LogAnything.objects\
            .filter(timestamp__gte=min, timestamp__lte=max, name="visited page")\
            .count()

# the number of users who joined within the requested time frame
def num_users(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return User.objects\
        .filter(date_joined__gte=min, date_joined__lte=max)\
        .count()

# 'active users' during a min-max time period
# calculated by finding the number of users who logged a page view
#   within the requested time frame
def num_active_users(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    day_ago = max - timedelta(days=1)
    return pageviews(min, max).values('user_id').distinct().count()

# total number of deployed apps
def num_deployed_apps():
    return App.objects.filter(deployment_id__isnull=False).count()
