from app_builder import naming


# map from internal identifier to what it actually is
IMPORTS = { 'django.models':            'from django.db import models',
            'django.models.AbstractUser':       'from django.contrib.auth.models import AbstractUser',
            'django.models.User':       'from django.contrib.auth.models import User',

            'django.HttpResponse':      'from django.http import HttpResponse',
            'django.redirect':          'from django.shortcuts import redirect',
            'django.render':            'from django.shortcuts import render',
            'django.render_to_response':'from django.shortcuts import render_to_response',
            'django.get_object_or_404': 'from django.shortcuts import get_object_or_404',

            'django.login_required':    'from django.contrib.auth.decorators import login_required',
            'django.require_GET':       'from django.views.decorators.http import require_GET',
            'django.require_POST':      'from django.views.decorators.http import require_POST',
            'django.csrf_exempt':       'from django.views.decorators.csrf import csrf_exempt',

            'django.simplejson':        'from django.utils import simplejson',
            'django.JsonResponse':      'from webapp.utils import JsonResponse', # assumes that it's copied from code_boilerplate folder
            'django.search':            'from webapp.utils import get_results',

            'django.patterns':          'from django.conf.urls import patterns',
            'django.settings':          'from django.conf import settings',
            'django.include':           'from django.conf.urls import include',
            'django.url':               'from django.conf.urls import url',
            'django.url.statics':       'from django.contrib.staticfiles.urls import staticfiles_urlpatterns',
            'django.url.reverse':       'from django.core.urlresolvers import reverse',

            'django.test.TestCase':     'from django.test import TestCase',
            'django.test.Client':       'from django.test.client import Client',

            'django.forms':             'from django import forms',
            'django.forms.AuthForm':    'from django.contrib.auth.forms import AuthenticationForm',
            'django.forms.UserCreationForm':    'from django.contrib.auth.forms import UserCreationForm',

            'django.admin':             'from django.contrib import admin',
            'django.auth.admin':        'from django.contrib.auth.admin import UserAdmin',
            'django.auth.login':        'from django.contrib.auth import login',
            'django.auth.authenticate': 'from django.contrib.auth import authenticate',
            'django.auth.logout_view':  'from django.contrib.auth.views import logout',

            'django.signals.post_save': 'from django.db.models.signals import post_save',
            'django.cbv.redirect_view':   'from django.views.generic import RedirectView',
            'django.template.render_to_string': 'from django.template.loader import render_to_string',

            'utils.import_export.resources':  'from import_export import resources',
            'utils.import_export.admin.model_admin': 'from import_export.admin import ImportExportModelAdmin',
            'utils.requests.post':           'from requests import post',

            # Generated application imports
            'utils.webapp.emailer':           'from webapp.emailer import send_email',
            'utils.webapp.template_emailer':   'from webapp.emailer import send_template_email',


}


FILE_IMPORT_MAP = { 'webapp/models.py': ('django.models', 'django.settings', 'django.models.AbstractUser', 'django.signals.post_save', 'utils.import_export.resources'),
                 'webapp/admin.py': ('utils.import_export.admin.model_admin', 'django.admin', 'django.auth.admin','django.forms'),
                 'webapp/pages.py': ('django.HttpResponse',
                                    'django.login_required',
                                    'django.require_GET',
                                    'django.require_POST',
                                    'django.csrf_exempt',
                                    'django.simplejson',
                                    'django.redirect',
                                    'django.search',
                                    'django.render',
                                    'django.render_to_response',
                                    'django.get_object_or_404'),
                 'webapp/form_receivers.py': ('django.HttpResponse',
                                            'django.login_required',
                                            'django.require_GET',
                                            'django.require_POST',
                                            'django.csrf_exempt',
                                            'django.simplejson',
                                            'django.JsonResponse',
                                            'django.redirect',
                                            'django.render',
                                            'django.render_to_response',
                                            'django.url.reverse',
                                            'django.get_object_or_404',
                                            'utils.webapp.emailer',
                                            'utils.webapp.template_emailer'),
                 'webapp/forms.py': ('django.forms', 'django.forms.UserCreationForm'),
                 'webapp/urls.py': ('django.patterns', 'django.admin',
                                    'django.include', 'django.url',
                                    'django.url.statics', 'django.auth.logout_view',
                                    'django.cbv.redirect_view', 'django.url.reverse'),
                 'webapp/emailer.py': ('utils.requests.post','django.template.render_to_string'),
                 'webapp/tests.py': ('django.test.TestCase', 'django.test.Client')
}


def create_import_namespace(file_path):
    def add_imports_to_ns(ns, import_lines):
        for i in import_lines:
            prim_name = IMPORTS[i].split('import')[1].strip()
            ns.find_or_create_import(i, prim_name) # adds to the import namespace ;)

    ns = naming.Namespace()
    add_imports_to_ns(ns, FILE_IMPORT_MAP[file_path])
    return ns
