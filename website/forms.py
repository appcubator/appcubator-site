from django import forms
from django.contrib.comments.forms import CommentSecurityForm
from django.contrib.contenttypes.models import ContentType
from django.utils.encoding import force_unicode

class ToggleLoveForm(CommentSecurityForm):
	def get_filter_kwargs(self):
		return {
			'content_type': ContentType.objects.get_for_model(self.target_object),
			'object_pk': force_unicode(self.target_object._get_pk_val()),
		}