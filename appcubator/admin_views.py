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
from datetime import datetime, timedelta, date
import time
from django.utils import timezone
from django.core.serializers.json import DjangoJSONEncoder
from django.core.paginator import Paginator, EmptyPage, PageNotAnInteger
from django.core.cache import cache

from appcubator.stats import *

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_home(request):
    page_context = {}
    now = datetime.utcnow()
    now = int(time.mktime(now.timetuple()))
    beginning = datetime(year=2013, month=6, day=26)
    beginning = int(time.mktime(beginning.timetuple()))

    users_today = cache.get('users_today', recent_users(long_ago=timedelta(days=0), limit=200))
    users_last_week = cache.get('users_last_week', recent_users(long_ago=timedelta(days=7), limit=50))
    most_active_users = cache.get('most_active_users', logs_per_user(limit=100))

    users_today_timeout = 3600
    users_last_week_timeout = 60*60*6 # refresh every 6 hrs
    most_active_users_timeout = 60*60*6*24 # refresh every 24 hours

    # cache.set('users_today', users_today, users_today_timeout)
    cache.set('users_last_week', users_last_week, users_last_week_timeout)
    cache.set('most_active_users', most_active_users, most_active_users_timeout)

    # active users
    page_context["users_today"] = users_today
    page_context["users_last_week"] = users_last_week
    page_context["most_active_users"] = most_active_users
    page_context['active_users'] = active_users_json(request, beginning, now, 'day').content
    page_context['user_signups_cumulative'] = user_signups_cumulative_json(request, beginning, now, 'day').content
    page_context['user_signups'] = user_signups_json(request).content

    # deployed apps stats
    page_context["avg_deployment_time"] = avg_deployment_time()
    page_context["num_deployed_apps"] = App.objects.filter(deployment_id__isnull=False).count()

    return render(request, 'admin/home.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def get_snapshots(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    snapshots = AppstateSnapshot.filter(app=app).order_by('snapshot_date')
    page_context = {}
    page_context["snapshots"] = snapshots
    return render(request, 'admin/snapshots.html')

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_customers(request):
    page_context = {}
    page_context["customers"] = Customer.objects.all()
    return render(request, 'admin/customers.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_users(request):
    users_all = User.objects.order_by('-id')
    paginator = Paginator(users_all, 100)
    page = request.GET.get('page')
    try:
        users = paginator.page(page)
    #if page index is invalid, return first page
    except PageNotAnInteger:
        users = paginator.page(1)
    #if page index is out of range, return last page
    except EmptyPage:
        users = paginator.page(paginator.num_pages)
    page_context = {}
    page_context["users"] = users
    return render(request, 'admin/users.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_user(request, user_id):
    user_id = long(user_id)
    user = get_object_or_404(User, id=user_id)
    logs_all = LogAnything.objects.filter(user_id=user_id).order_by('-id')
    apps = App.objects.filter(owner=user_id)
    paginator = Paginator(logs_all, 100)
    page = request.GET.get('page')
    try:
        logs = paginator.page(page)
    #if page index is invalid, return first page
    except PageNotAnInteger:
        logs = paginator.page(1)
    #if page index is out of range, return last page
    except EmptyPage:
        logs = paginator.page(paginator.num_pages)
    page_context = {}
    page_context["user"] = user
    page_context["apps"] = apps
    page_context["userlogs"] = logs
    page_context['user_logs_graph'] = user_logs_graph(request, user_id).content
    page_context["apps"] = apps
    return render(request, 'admin/user.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_apps(request):
    apps_all = App.objects.order_by('-id')
    paginator = Paginator(apps_all, 100)
    page = request.GET.get('page')
    try:
        apps = paginator.page(page)
    #if page index is invalid, return first page
    except PageNotAnInteger:
        apps = paginator.page(1)
    #if page index is out of range, return last page
    except EmptyPage:
        apps = paginator.page(paginator.num_pages)
    page_context = {}
    page_context["apps"] = apps
    return render(request, 'admin/apps.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_app(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    logs_all = LogAnything.objects.filter(user_id=app.owner.id, app_id=app_id).order_by('-id')
    paginator = Paginator(logs_all, 100)
    page = request.GET.get('page')
    try:
        logs = paginator.page(page)
    #if page index is invalid, return first page
    except PageNotAnInteger:
        logs = paginator.page(1)
    #if page index is out of range, return last page
    except EmptyPage:
        logs = paginator.page(paginator.num_pages)
    page_context = {}
    page_context["app"] = app
    page_context["app_id"] = app_id
    page_context["app_logs"] = logs
    return render(request, 'admin/app.html', page_context)


@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_app_snaps(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    snaps_all = AppstateSnapshot.objects.filter(app=app).order_by('-id')
    paginator = Paginator(snaps_all, 20)
    page = request.GET.get('page')
    try:
        snaps = paginator.page(page)
    #if page index is invalid, return first page
    except PageNotAnInteger:
        snaps = paginator.page(1)
    #if page index is out of range, return last page
    except EmptyPage:
        snaps = paginator.page(paginator.num_pages)
    page_context = {}
    page_context["app"] = app
    page_context["app_id"] = app_id
    page_context["snaps"] = snaps
    return render(request, 'admin/app-snaps.html', page_context)


@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_feedback(request):
    page_context = {}
    feedback = list(LogAnything.objects.filter(name='posted feedback'))
    page_context["feedback"] = feedback
    return render(request, 'admin/feedback.html', page_context)

@login_required
@user_passes_test(lambda u: u.is_superuser)
def admin_walkthroughs(request):
    num_users = User.objects.all().count()
    started_quicktour = unique_user_logs(get_logs({'name': 'started quick tour'}))
    started_indepth_walkthrough = unique_user_logs(get_logs({'name': 'started in-depth twitter walkthrough'}))
    started_simple_walkthrough = unique_user_logs(get_logs({'name': 'started simple twitter walkthrough'}))
    finished_quicktour = unique_user_logs(get_logs({'name': 'finished quick tour'}))
    finished_indepth_walkthrough = unique_user_logs(get_logs({'name': 'finished in-depth twitter walkthrough'}))
    finished_simple_walkthrough = unique_user_logs(get_logs({'name': 'finished simple twitter walkthrough'}))

    num_started_quicktour = started_quicktour.count()
    num_started_indepth_walkthrough = started_indepth_walkthrough.count()
    num_started_simple_walkthrough = started_simple_walkthrough.count()
    num_finished_quicktour = finished_quicktour.count()
    num_finished_indepth_walkthrough = finished_indepth_walkthrough.count()
    num_finished_simple_walkthrough = finished_simple_walkthrough.count()

    page_context = {}
    page_context["num_started_quicktour"] = num_started_quicktour
    page_context["num_started_indepth_walkthrough"]  = num_started_indepth_walkthrough
    page_context["num_started_simple_walkthrough"] = num_started_simple_walkthrough
    page_context["num_finished_quicktour"] = num_finished_quicktour
    page_context["num_finished_indepth_walkthrough"] = num_finished_indepth_walkthrough
    page_context["num_finished_simple_walkthrough"] = num_finished_simple_walkthrough
    page_context["p_started_quicktour"] = percentage(num_started_quicktour, num_users)
    page_context["p_started_indepth_walkthrough"] = percentage(num_started_indepth_walkthrough, num_users)
    page_context["p_started_simple_walkthrough"] = percentage(num_started_simple_walkthrough, num_users)
    page_context["p_finished_quicktour"] = percentage(num_finished_quicktour, num_started_quicktour)
    page_context["p_finished_indepth_walkthrough"] = percentage(num_finished_indepth_walkthrough, num_started_indepth_walkthrough)
    page_context["p_finished_simple_walkthrough"] = percentage(num_finished_simple_walkthrough, num_started_simple_walkthrough)
    page_context['avg_last_step_simple'] = get_avg_last_walkthrough_step(started_simple_walkthrough, 'simple')
    page_context['avg_last_step_indepth'] = get_avg_last_walkthrough_step(started_indepth_walkthrough, 'in-depth')
    return render(request, 'admin/walkthroughs.html', {'data_json': json.dumps(page_context), 'data': page_context})

@login_required
@user_passes_test(lambda u: u.is_superuser)
def user_logs_graph(request, user_id):
    logs = get_logs({'user_id': long(user_id)})\
                .extra(select={'date': 'date(timestamp)'})\
                .values('date')\
                .annotate(num_logs=Count('id'))\
                .order_by('date')
    result = [{'date': str(x['date']), 'num_logs': x['num_logs']} for x in logs]
    return HttpResponse(json.dumps(result), mimetype="application/json")

@login_required
@user_passes_test(lambda u: u.is_superuser)
def logs(request):
    logs = get_logs(request.GET).values('id', 'user_id', 'app_id', 'name', 'timestamp', 'data')
    for log in logs:
        log['timestamp'] = str(log['timestamp'])
    return HttpResponse(logs, mimetype="application/json")

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
@user_passes_test(lambda u:u.is_superuser)
def user_signups_cumulative_json(request, t_start, t_end, t_delta):
    t_start = int(t_start)
    t_end = int(t_end)
    t_delta = str(t_delta)
    try:
        start = datetime.fromtimestamp(t_start)
        end = datetime.fromtimestamp(t_end)
    except ValueError:
        return HttpResponse("Invalid start/end values (%d,%d), must be passed as POSIX datetime number" % (int(t_start),int(t_end)), status=405)
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
        data[tempStart.strftime("%m/%d/%y")] = num_users_joined(None, tempEnd, cumulative=True)
        tempStart = tempEnd
        tempEnd = tempEnd + delta
    return HttpResponse(json.dumps(data), mimetype="application/json")

@login_required
@user_passes_test(lambda u: u.is_superuser)
def active_users_json(request, t_start, t_end, t_delta):
    t_start = int(t_start)
    t_end = int(t_end)
    t_delta = str(t_delta)
    try:
        start = datetime.fromtimestamp(t_start)
        end = datetime.fromtimestamp(t_end)
    except ValueError:
        return HttpResponse("Invalid start/end values (%d,%d), must be passed as POSIX datetime number" % (int(t_start),int(t_end)), status=405)
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
        key = tempStart.strftime("%m/%d/%y")
        if tempEnd < datetime.now() - timedelta(days=7):
            result = cache.get('num_active_users_'+key, num_active_users(tempStart, tempEnd))
        else:
            result = num_active_users(tempStart, tempEnd)
            cache.set('num_active_users_'+key, result)
        data[key] = result
        tempStart = tempEnd
        tempEnd = tempEnd + delta
    return HttpResponse(json.dumps(data), mimetype="application/json")


# active users this past week/day/month
def recent_users(long_ago=timedelta(days=1), limit=10):
    today = timezone.now().date()
    time_ago = today - long_ago
    users = LogAnything.objects.filter(timestamp__gte=time_ago)\
            .exclude(user_id=None)\
            .values_list('user_id', flat=True).distinct()
    if len(users) > limit:
        users = users[:limit]
    result = []
    for user_id in users:
        user = User.objects.get(id=long(user_id))
        num_logs = LogAnything.objects.filter(timestamp__gte=time_ago, user_id=user_id).count()
        fullName = "%s %s" % (user.first_name, user.last_name)
        num_apps = user.apps.count()
        result.append({'user_id': user_id, 'num_logs': num_logs, 'name': fullName, 'num_apps': num_apps})
    result.sort(key=lambda x: x['num_logs'], reverse=True)
    # limit results to top [limit]
    if len(result) > limit:
        result = result[:limit]
    return result

# Top [limit] users with most page visits
def logs_per_user(limit=10):
    users = LogAnything.objects\
                .exclude(user_id=None)\
                .values_list('user_id', flat=True).distinct()
    result = []
    for user_id in users:
        user = User.objects.get(id=long(user_id))
        num_logs = LogAnything.objects.filter(user_id=user_id).count()
        obj = {}
        obj['user_id'] = user_id
        obj['user'] = user
        obj['num_apps'] = user.apps.count()
        obj['num_logs'] = num_logs
        result.append(obj)
    result.sort(key=lambda x: x['num_logs'], reverse=True)
    # limit results to top [limit]
    if len(result) > limit:
        result = result[:limit]
    return result

# def avg_deployment_time():
#     deploy_logs_data = [log.data_json for log in get_logs({'name': "deployed app"})]
#     deploy_times = []
#     for d in deploy_logs_data:
#         if "deploy_time" in d:
#             number = float(d["deploy_time"].replace(" seconds", ""))
#             deploy_times.append(number)
#     if(len(deploy_times)):
#         return sum(deploy_times) / len(deploy_times)
#     else:
#         return 0.0

# the number of unique apps deployed within the requested time frame
def deployed_apps(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 6, 26)
    return LogAnything.objects\
        .filter(timestamp__gte=min, timestamp__lte=max, name="deployed app")\
        .distinct('app_id').count()

# page views within the requested time frame
def pageviews(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 6, 26)
    return get_logs({'start': min, 'end': max, 'name': 'visited page'})


# users who joined within the requested time frame
def users_joined(min, max=datetime.now()):
    # default starting date july 26, 2013
    if(min is None):
        min = date(2013, 6, 26)
    return User.objects.filter(date_joined__gte=min, date_joined__lte=max)

def num_users_joined(min, max=datetime.now(), cumulative=False):
    if cumulative:
        min=None
    return users_joined(min, max).count()


# 'active users' during a min-max time period
# calculated by finding the number of users who logged a page view
#   within the requested time frame
def num_active_users(min, max=datetime.now()):
    # default starting date july 13, 2013
    if(min is None):
        min = datetime.date(2013, 7, 13)
    return pageviews(min, max).values('user_id').distinct().count()


def JSONResponse(data, **kwargs):
    return HttpResponse(json.dumps(data, cls=DjangoJSONEncoder), mimetype="application/json", **kwargs)
