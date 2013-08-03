"""Util Functions for running DB queries for statistics purposes"""
from models import *
from django.db.models import Avg, Count
from datetime import datetime, timedelta, date
import time
import json
import urllib
from operator import add

T0 = date(2013, 6, 26)

"""
filter a Query to within a specificed timeframe
@param query_set: a Django QuerySet
@param file_name: the name of a Django Model property (of type DateTimeField)
"""
def timeframe(query_set, field_name, min=date(2013, 6, 26), max=datetime.now()):
	filter__gte = field_name + '__' + 'gte'
	filter__lte = field_name + '__' + 'lte'
	return query_set.filter(**{filter__gte: min, filter__lte: max})

# get all the logs by a certain user
def user_logs(user_id):
	return LogAnything.objects.filter(user_id=user_id)


def get_logs(args):
    logs = LogAnything.objects
    if 'name' in args:
        logs = logs.filter(name=urllib.unquote_plus(args['name']))
    if 'app_id' in args:
        logs = logs.filter(app_id=args['app_id'])
    if 'user_id' in args:
        logs = logs.filter(user_id=args['user_id'])
    if 'start' in args:
        logs = logs.filter(timestamp__gte=args['start'])
    if 'end' in args:
        logs = logs.filter(timestamp__lte=args['end'])
    return logs.exclude(user_id=None)


# Get a queryset of all the deployment logs
def deployments(query_set=None):
	if query_set is None:
		return LogAnything.objects.filter(name='deployed app')
	else:
		return query_set.filter(name='deployed app')

# get a queryset of all the pageview logs
def pageviews(query_set=None):
	if query_set is None:
		return LogAnything.objects.filter(name='visited page')
	else:
		return query_set.filter(name='visited page')


def unique_user_logs(query_set=None, min=T0, max=datetime.now(), count=False):
	if query_set is None:
		query = timeframe(LogAnything.objects.all(), min, max)
	else:
		query = query_set
	query = query.values('user_id').distinct()
	if not count:
		return query
	else:
		return query.count()


def deployed_apps(count=False):
	query = App.objects.filter(deployment_id__isnull=False)
	if not count:
		return query
	else:
		return query.count()

def avg_deployment_time():
    deploy_logs_data = get_logs({'name': "deployed app"}).values_list('data', flat=True)
    deploy_logs_json = map(json.loads, deploy_logs_data)
    deploy_times = filter(lambda d: 'deploy_time' in d, deploy_logs_json)

    def get_deploy_time(d):
    		return float(d['deploy_time'].replace(" seconds", ""))

    deploy_times = map(get_deploy_time, deploy_times)
    if(len(deploy_times)):
        return sum(deploy_times) / len(deploy_times)
    else:
        return 0.0

def percentage(part, whole):
  return 100 * float(part)/float(whole) if whole else 0.0
