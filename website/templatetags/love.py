from __future__ import absolute_import

from django import template
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.contrib.contenttypes.models import ContentType
from django.contrib.sessions.backends.db import SessionStore

from love.models import Love
from love.forms import ToggleLoveForm

register = template.Library()

@register.simple_tag
def love_toggle_form(obj):
	"""
	Renders a form for toggling Love on an object.
	
	Syntax::
	
		{% love_toggle_form <object_instance> %}
	
	"""
	return ToggleLoveForm(obj)

@register.simple_tag
def love_count(obj):
	"""
	Renders the number of Loves on an object.

	Syntax::

		{% love_count <object_instance> %}

	"""
	content_type = ContentType.objects.get_for_model(obj)
	return Love.objects.filter(content_type=content_type, object_pk=obj.pk).count()

@register.filter
def loves(value, obj):
	"""
	Returns True if val represents either a user or session that has loved obj. False otherwise.
	
	Syntax::
	
		{% if <User or SessionStore instance>|loves:<object_instance> %}<result>{% endif %}
	
	"""
	content_type = ContentType.objects.get_for_model(obj)
	filters = {'content_type': content_type, 'object_pk': obj.pk}
	
	if isinstance(value, User):
		filters['user'] = value
	elif isinstance(value, SessionStore):
		filters['session_key'] = value.session_key
	else:
		return False
	
	if Love.objects.filter(**filters).count() > 0:
		return True
	
	return False