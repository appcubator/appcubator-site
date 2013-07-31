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
import time
from django.utils import timezone

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_home(request):
    page_context = {}

    # active users
    page_context["users_today"] = recent_users(long_ago=timedelta(days=1))
    page_context["users_last_week"] = recent_users(long_ago=timedelta(days=7))
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
    logs = LogAnything.objects.filter(user_id=app.owner.id, app_id=app_id)
    page_context = {}
    page_context["app"] = app
    page_context["app_id"] = app_id
    page_context["app_logs"] = logs
    return render(request, 'admin/app.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_feedback(request):
    page_context = {}
    feedback = list(LogAnything.objects.filter(name='posted feedback'))
    page_context["feedback"] = feedback
    return render(request, 'admin/feedback.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_graphs(request):
    now = datetime.utcnow()
    now = int(time.mktime(now.timetuple())) * 1000
    beginning = datetime(year=2013, month=6, day=26)
    beginning = int(time.mktime(beginning.timetuple())) * 1000
    page_context = {}
    page_context["now"] = now
    page_context["beginning"] = beginning
    page_context['active_users'] = active_users_json(request, page_context['beginning'], page_context['now'], 'day').content
    page_context['user_signups'] = user_signups_json(request).content
    return render(request, 'admin/graphs.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def user_signups_json(request):
    # group number of users by date (not datetime) user joined
    users = User.objects\
                .extra(select={'day_joined': 'date(date_joined)'})\
                .values('day_joined')\
                .annotate(num_users=Count('id'))\
                .order_by('day_joined')
    # format date objects as strings for JSON serialization
    result = [{'day_joined': str(x['day_joined']), 'num_users': x['num_users']} for x in list(users)]
    #result = [{str(x['day_joined']): x['num_users']} for x in users]
    return HttpResponse(json.dumps(result), mimetype="application/json")

@login_required
@user_passes_test(lambda u: u.is_superuser)
def active_users_json(request, t_start, t_end, t_delta):
    t_start = int(t_start)
    t_end = int(t_end)
    t_delta = str(t_delta)
    try:
        start = datetime.fromtimestamp(t_start / 1000.0)
        end = datetime.fromtimestamp(t_end / 1000.0)
    except ValueError:
        return HttpResponse("Invalid start/end values (%d,%d), must be passed as POSIX datetime number" % (int(start),int(end)), status=405)
    # require start < end
    if end < start:
        start, end = end, start
    # determine timedelta
    if (t_delta == "day"):
        delta = timedelta(days=1)
    elif (t_delta == "year"):
        delta = timedelta(days=365)
    elif (t_delta == "month"):
        delta = timedelta(days=30)
    elif (t_delta == "week"):
        delta = timedelta(weeks=1)
    else:
        return HttpResponse("invalid delta string (%s), must be 'day', 'week', 'month', or 'year'" % t_delta, status=405)

    tempStart = start
    tempEnd = tempStart + delta
    data = {}
    while tempEnd < end:
        data[tempStart.strftime("%m/%d/%y")] = num_active_users(tempStart, tempEnd)
        tempStart = tempEnd
        tempEnd = tempEnd + delta
    return HttpResponse(json.dumps(data), mimetype="application/json")

# active users this past week
def recent_users(long_ago=timedelta(days=1)):
    today = timezone.now().date()
    time_ago = today - long_ago
    logs = LogAnything.objects\
        .filter(timestamp__gte=time_ago, name="visited page")\
        .exclude(user_id=None)\
        .values('user_id').distinct()\
        .annotate(num_logs=Count('user_id'))\
        .order_by('-num_logs')
    for log in logs:
        user_id = log["user_id"]
        log["user"] = ExtraUserData.objects.get(user_id=user_id)
        log["name"] = log["user"].user.first_name + " " + log["user"].user.last_name
        log["num_apps"] = log["user"].user.apps.count()
    return logs

# Top 10 users with most page visits
def logs_per_user():
    page_visits = LogAnything.objects.filter(name='visited page').exclude(user_id=None)
    logs_per_user = page_visits.values('user_id').annotate(num_logs=Count('user_id'))
    if len(logs_per_user) > 10:
        logs_per_user = logs_per_user[:10]
    for x in logs_per_user:
        user_id = x["user_id"]
        x["user"] = ExtraUserData.objects.get(user_id=user_id)
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

# page views within the requested time frame
def pageviews(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return LogAnything.objects\
            .filter(timestamp__gte=min, timestamp__lte=max, name="visited page")

# the number of page views within the requested time frame
def num_pageviews(min, max=datetime.now()):
    return pageviews(min,max).count()

# users who joined within the requested time frame
def users_joined(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return User.objects\
        .filter(date_joined__gte=min, date_joined__lte=max)

# the number of users who joined within the requested time frame
def num_users_joined(min, max=datetime.now()):
    return users_joined(min,max).count()

# 'active users' during a min-max time period
# calculated by finding the number of users who logged a page view
#   within the requested time frame
def num_active_users(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return pageviews(min, max).values('user_id').distinct().count()

# total number of deployed apps
def num_deployed_apps():
    return App.objects.filter(deployment_id__isnull=False).count()


def JSONResponse(serializable_obj, **kwargs):
    """Just a convenience function, in the middle of horrible code"""
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)
