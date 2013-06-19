from django.http import HttpResponse, HttpRequest
from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.shortcuts import redirect,render, get_object_or_404
from django.contrib.auth.decorators import login_required
from django.contrib.auth import forms as auth_forms, authenticate, login
from django.core.exceptions import ValidationError
from django import forms
from django.utils import simplejson
from copy import deepcopy

from models import Customer

import requests
import re


def test_editor(request):
    return render(request, 'tests/editor-SpecRunner.html', {})
