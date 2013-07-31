"""Util Functions for running DB queries for statistics purposes"""
from models import *
from django.db.models import Avg, Count
from datetime import datetime, timedelta
import time
import json

"""
filter a Query to within a specificed timeframe
@param query_set: a Django QuerySet
@param file_name: the name of a Django Model property (of type DateTimeField)
"""
def timeframe(query_set, field_name, min=datetime.date(2013, 6, 26), max=dateTime.now()):
	filter__gte = field_name + '__' + 'gte'
	filter__lte = field_name + '__' + 'lte'
	return query_set.filter(**{filter__gte: min, filter__lte: max})

# get all the logs by a certain user
def user_logs(user_id):
	return LogAnything.objects.filter(user_id=user_id)


# Get logs of a certain type
def log_data(name, query_set=None):
	if query_set is Nonde:
		return LogAnything.objects.filter(name=name)
	else:
		return query_set.filter(name=name)


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


def unique_user_logs(query_set=None, min, max=datetime.now(), count=False):
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
