from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect,render, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings

from models import App, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts, TutorialLog

import requests
import traceback
import datetime

def JSONResponse(data, *args, **kwargs):
  return HttpResponse(simplejson.dumps(data), *args, mimetype="application/json", **kwargs)

from django.forms import ModelForm
class ThemeStaticFileForm(ModelForm):
  class Meta:
    model = StaticFile
    exclude = ('app', 'theme')

  def __init__(self, theme, *args, **kwargs):
    self.theme = theme
    super(ThemeStaticFileForm, self).__init__(*args, **kwargs)

  def save(self, *args, **kwargs):
    self.instance.theme = self.theme
    return super(ThemeStaticFileForm, self).save(*args, **kwargs)

def single_theme(f):
  def ret_f(request, theme_id, *args, **kwargs):
    # permissions plz...
    theme = get_object_or_404(UITheme, pk=theme_id)
    return f(request, theme, *args, **kwargs)
  return ret_f


def add_statics_to_context(context, app):
  context['statics'] = simplejson.dumps(list(StaticFile.objects.filter(app=app).values()))
  return context


@login_required
@single_theme
def themestaticfiles(request, theme):
  if request.method != 'GET' and request.method != 'POST':
    return HttpResponse("Method not allowed", status=405)
  if request.method == 'GET':
    sf = StaticFile.objects.filter(theme=theme).values('name','url','type')
    return JSONResponse(list(sf))
  if request.method == 'POST':
    sf_form = ThemeStaticFileForm(theme, request.POST)
    if sf_form.is_valid():
      sf_form.save()
      return JSONResponse({})
    else:
      return JSONResponse({ "error": "One of the fields was not valid." })


@login_required
def designer_page(request):
  themes = UITheme.objects.all()
  page_context = { 'title' : 'Gallery', 'themes' : themes }
  return render(request, 'designer-page.html', page_context)


@require_POST
@login_required
def theme_new_web(request):
  if request.method=="POST":
    name = request.POST['name']
    theme = UITheme(name=name, designer=request.user, web_or_mobile='W')
    theme.save()
    return HttpResponse(simplejson.dumps(theme.to_dict()), mimetype="application/json")


@require_POST
@login_required
def theme_new_mobile(request):
  if request.method=="POST":
    name = request.POST['name']
    theme = UITheme.create_mobile_theme(name, request.user)
    return HttpResponse(simplejson.dumps(theme.to_dict()), mimetype="application/json")


@login_required
@single_theme
def theme_show(request, theme):
  #theme = get_object_or_404(UITheme, pk = theme_id)
  page_context = { 'title' : theme.name , 'themeId': theme.pk, 'theme' : theme._uie_state_json, 'statics' : simplejson.dumps(list(theme.statics.values()))}
  return render(request, 'designer-theme-show.html', page_context)


@require_POST
@login_required
def theme_info(request, theme_id):
  theme = get_object_or_404(UITheme, pk = theme_id)
  page_context = { 'themeInfo' : theme.to_dict(), 'theme' : theme.uie_state }
  return HttpResponse(simplejson.dumps(page_context), mimetype="application/json")


@login_required
def theme_page_editor(request, theme_id, page_id):
  theme_id = long(theme_id)
  theme = get_object_or_404(UITheme, pk = theme_id)
  page_context = { 'theme': theme,
                   'title' : 'Design Editor',
                   'theme_state' : theme._uie_state_json,
                   'page_id': page_id,
                   'theme_id': theme_id }
  #add_statics_to_context(page_context, app)
  return render(request, 'designer-editor-main.html', page_context)


@require_POST
@login_required
@single_theme
def theme_edit(request, theme):
  if 'name' in request.POST:
    theme.name = request.POST['name']

  if 'uie_state' in request.POST:
    uie_json = request.body
    theme.uie_state = simplejson.loads(uie_json)

  theme.save()
  return HttpResponse("ok")


@require_POST
@login_required
@single_theme
def theme_clone(request, theme):
  # want to start a new theme from an existing theme
  new_theme = theme.clone(user=request.user)
  return HttpResponse(simplejson.dumps(new_theme.to_dict), mimetype="application/json")


@require_POST
@login_required
@single_theme
def theme_delete(request, theme):
  # want to get a specific theme
  theme.delete()
  return HttpResponse("ok")

