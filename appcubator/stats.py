"""Util Functions for running DB queries for statistics purposes"""
from models import *
from django.db.models import Avg, Count
from datetime import datetime, timedelta, date
import time
import json
import urllib
from operator import add

T0 = date(2013, 6, 26)

def mean(arr):
	return float(sum(arr)) / float(len(arr)) if len(arr) else 0.0

def percentage(part, whole):
  return 100 * float(part)/float(whole) if whole else 0.0

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
	query = query.values_list('user_id', flat=True).distinct()
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
        return mean(deploy_times)
    else:
        return 0.0

# given a LogAnything QuerySet, return a list of the data attributes, parsed
# as dictionaries. if attr is specified, return a specific attribute in the data
def log_data(query_set=None, attr=None):
	if query_set is None:
		query_set = LogAnything.objects.all()
	query_set = query_set.values_list('data', flat=True)
	data = map(json.loads, query_set)
	if attr is not None:
		return [d[attr] for d in data if attr in d]
	else:
		return data

# given a queryset of users who have done a walkthrough,
# find the average last step completed
def get_avg_last_walkthrough_step(query_set, walkthrough='simple'):
	max_steps = []
	for user_id in query_set:
		if walkthrough is 'simple':
			logs = get_logs({'user_id': user_id, 'name': 'simple twitter walkthrough step'})
		else:
			logs = get_logs({'user_id': user_id, 'name': 'in-depth twitter walkthrough step'})
		steps = log_data(logs, 'step')
		max_steps.append(max(steps) if len(steps) else 0)
	return mean(max_steps)
