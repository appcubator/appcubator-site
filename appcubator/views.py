from django.http import HttpResponse
from django.contrib.auth.decorators import login_required
from django.views.decorators.http import require_GET, require_POST
from django.utils import simplejson
from django.shortcuts import redirect, render, render_to_response, get_object_or_404
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from django.core.urlresolvers import reverse
from django.http import Http404

from models import App, StaticFile, UITheme, ApiKeyUses, ApiKeyCounts, AppstateSnapshot, LogAnything, InvitationKeys, Customer, ExtraUserData, AnalyticsStore
from email.sendgrid_email import send_email, send_template_email
from models import DomainRegistration
from models import get_default_uie_state, get_default_mobile_uie_state
from models import get_default_app_state, get_default_theme_state

import app_builder.analyzer as analyzer
from app_builder.analyzer import App as AnalyzedApp
from app_builder.utils import get_xl_data, add_xl_data, get_model_data

from payments.views import subscribe

import requests
import traceback
import datetime
import shlex
import subprocess
import os
from datetime import datetime


def add_statics_to_context(context, app):
    context['statics'] = simplejson.dumps(list(
        StaticFile.objects.filter(app=app).values()))
    return context


@login_required
@require_GET
def app_welcome(request):
    if request.user.extradata.noob:
        # case for turning noob mode off
        if request.user.apps.count() > 0:
            e = request.user.extradata
            e.noob = 0
            e.save()
            return redirect(app_page, request.user.apps.all()[0].id)
        return redirect(app_noob_page)

    if request.user.apps.count() == 0:
        return redirect(app_new)
    else:
        return redirect(app_page, request.user.apps.latest('id').id)


def app_noob_page(request):
    #log url route
    user_id = request.user.id
    page_name = 'welcome'
    app_id = 0
    log = LogAnything(user_id=user_id, app_id=app_id, name="visited page", data={"page_name": "welcome"})
    log.save()

    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]
    default_data = {
        'app' : { 'id': 0},
        'default_state': get_default_app_state(),
        'title': 'My First App',
        'default_mobile_uie_state': get_default_mobile_uie_state(),
        'default_uie_state': get_default_app_state(),
        'themes': simplejson.dumps(list(themes)),
        'mobile_themes': simplejson.dumps(list(mobile_themes)),
        'apps': request.user.apps.all(),
        'statics': simplejson.dumps([]),
        'user': request.user
    }
    return render(request, 'app-welcome-page.html', default_data)


@login_required
def app_new(request, is_racoon = False):
    if request.method == 'GET':
        #log url route
        user_id = request.user.id
        app_id = 0
        log = LogAnything(user_id=user_id, app_id=app_id, name="visited page", data={"page_name": "newapp"})
        log.save()
        return render(request, 'apps-new.html')
    elif request.method == 'POST':
        app_name = "Unnamed"
        if 'name' in request.POST:
            app_name = request.POST['name']
        a = App(name=app_name, owner=request.user)
        # set the name in the app state
        s = a.state
        s['name'] = a.name
        a.state = s
        try:
            a.full_clean()
        except Exception, e:
            return render(request,  'apps-new.html', {'old_name': app_name, 'errors': e}, status=400)
        a.save()
        if is_racoon:
            return redirect(app_new_racoon, a.id)
        else:
            return redirect(app_page, a.id)


@login_required
def app_new_racoon(request, app_id):
    #log url route
    user_id = request.user.id
    log = LogAnything(user_id=user_id, app_id=app_id, name="visited page", data={"page_name": "racoon"})
    log.save()
    page_context = {}
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    page_context['app_id'] = long(app_id)
    page_context['app_name'] = app.name
    return render(request, 'app-new-racoon.html', page_context)


@login_required
def app_new_walkthrough(request, walkthrough):
    app_name = "Twitter Demo"
    a = App(name=app_name, owner=request.user)
    # set the name in the app state
    s = a.state
    s['name'] = a.name
    if walkthrough is 'simpleWalkthrough':
        s['simpleWalkthrough'] = 1
        log_name = 'started simple twitter walkthrough'
    else:
        s['walkthrough'] = 1
        log_name = "started in-depth twitter walkthrough"
    a.state = s
    try:
        a.full_clean()
    except Exception, e:
        return render(request,  'apps-new.html', {'old_name': app_name, 'errors': e}, status=400)
    a.save()

    #log url route
    user_id = request.user.id
    log = LogAnything(user_id=user_id, app_id=a.id, name=log_name, data={})
    log.save()

    return redirect(app_page, a.id)


@require_GET
@login_required
def app_page(request, app_id):
    app_id = long(app_id)
    # id of 0 is reserved for sample app
    if(app_id == 0):
        return redirect(app_welcome)

    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]

    page_context = {'app': app,
                    'app_url': app.url(),
                    'app_id': long(app_id),
                    'title': 'The Garage',
                    'themes': simplejson.dumps(list(themes)),
                    'mobile_themes': simplejson.dumps(list(mobile_themes)),
                    'apps': app.owner.apps.all(),
                    'user': app.owner,
                    'is_deployed': 1 if app.deployment_id != None else 0}
    add_statics_to_context(page_context, app)
    return render(request, 'app-show.html', page_context)


@require_GET
@login_required
def app_json_editor(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    page_context = {'app': app,
                    'app_id': long(app_id),
                    }
    add_statics_to_context(page_context, app)
    return render(request, 'app-json-editor.html', page_context)


@login_required
def app_edit_theme(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    #theme = get_object_or_404(UITheme, pk = theme_id)
    page_context = {'title': 'Current Theme',
                    'appId': long(app_id),
                    'theme': app._uie_state_json}
    add_statics_to_context(page_context, app)

    return render(request, 'designer-theme-show.html', page_context)

@require_POST
@login_required
def app_delete(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    app.delete()
    return redirect("/")


@login_required
def app_state(request, app_id, validate=True):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    if request.method == 'GET':
        state = app_get_state(request, app)
        return JSONResponse(state)
    elif request.method == 'POST':
        status, data = app_save_state(request, app, require_valid=validate)
        return JSONResponse(data, status=status)
    else:
        return HttpResponse("GET or POST only", status=405)


@require_GET
@login_required
def app_get_state(request, app):
    return app.state


@require_POST
@login_required
def app_save_state(request, app, require_valid=True):
    # if the incoming appState's version_id does not match the
    # db's version_id, the incoming appState is an outdated version
    if not app.isCurrentVersion(simplejson.loads(request.body)):
        return (409, "")

    app._state_json = request.body
    app.state['name'] = app.name
    app.full_clean()

    if not require_valid:
        app.save()
        return (200, {'version_id': app.state.get('version_id', 0)})
    try:
        a = AnalyzedApp.create_from_dict(app.state, api_key=app.api_key)
    except analyzer.UserInputError, e:
        app.save()
        d = e.to_dict()
        d['version_id'] = app.state.get('version_id', 0)
        return (400, d)
    # raise on normal exceptions.
    else:
        # Save the app state for future use
        appstate_snapshot = AppstateSnapshot(owner=request.user,
            app=app, name=app.name, snapshot_date=datetime.now(), _state_json=request.body)
        appstate_snapshot.save()
        app.save()
        return (200, {'version_id': app.state.get('version_id', 0)})

@login_required
@csrf_exempt
def invitations(request):
    # get all invitations sent by user {{user_id}}
    if request.method == 'GET':
        user_id = int(request.user.id)
        invitations = list(InvitationKeys.objects.filter(inviter_id=user_id))
        json = []
        for i in invitations:
            json.append({"invitee": i.invitee, "date": str(i.date.date()), "accepted": i.accepted})
        return JSONResponse(json)
    # send an invitation from {{user_id}} to a friend
    else:
        firstName = request.POST['firstName']
        lastName = request.POST['lastName']
        email = request.POST['email']
        subject = request.POST['subject']
        message = request.POST['message']
        invitation = InvitationKeys.create_invitation(request.user, email)
        template_context = { "text": message }
        send_template_email(request.user.email, email, subject, "", "emails/base_boxed_basic_query.html", template_context)
        return HttpResponse("ok")

def documentation_page(request, page_name):
    try:
        if page_name == "feedback" and request.user.is_authenticated():
            page_name = "feedback-form-page"
        htmlString = render(request, 'documentation/html/'+page_name+'.html').content
    except Exception, e:
        htmlString = render(request, 'documentation/html/intro.html').content
    data = {
        'content': htmlString,
        'page_name': page_name
    }
    return render(request, 'documentation/documentation-base.html', data)

@login_required
def uie_state(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    if request.method == 'GET':
        state = app_get_uie_state(request, app)
        return JSONResponse(state)
    elif request.method == 'POST':
        status, message = app_save_uie_state(request, app)
        return HttpResponse(message, status=status)
    else:
        return HttpResponse("GET or POST only", status=405)


@login_required
def mobile_uie_state(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    if request.method == 'GET':
        state = app_get_uie_state(request, app)
        return JSONResponse(state)
    elif request.method == 'POST':
        status, message = app_save_mobile_uie_state(request, app)
        return HttpResponse(message, status=status)
    else:
        return HttpResponse("GET or POST only", status=405)


@csrf_exempt
def less_sheet(request, app_id, isMobile=False):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    css_string = app.css(deploy=False, mobile=isMobile)
    return HttpResponse(css_string, mimetype='text/css')

@csrf_exempt
def mobile_less_sheet(request, app_id):
    return less_sheet(request, app_id, True)


@csrf_exempt
def css_sheet(request, app_id, isMobile=False):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    uie_state = app.uie_state
    if isMobile:
        uie_state = app.mobile_uie.state
    page_context = {'uie_state': uie_state,
                    'title': 'Editor',
                    'app_id': app_id}
    add_statics_to_context(page_context, app)
    return render(request, 'app-editor-css-gen.html', page_context, mimetype='text/css')

@csrf_exempt
def mobile_css_sheet(request, app_id):
    return css_sheet(request, app_id, True)


@require_GET
@login_required
def app_get_uie_state(request, app):
    return app.uie_state


@require_POST
@login_required
def app_save_uie_state(request, app):
    app._uie_state_json = request.POST['uie_state']
    try:
        app.full_clean()
    except Exception, e:
        return (400, str(e))
    app.save(state_version=False)
    return (200, 'ok')


@require_POST
@login_required
def app_save_mobile_uie_state(request, app):
    app._mobile_uie_state_json = request.POST['uie_state']
    try:
        app.full_clean()
    except Exception, e:
        return (400, str(e))
    app.save(state_version=False)
    return (200, 'ok')


def app_emails(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    page_context = {'app': app, 'title': 'Emails', 'app_id': app_id}
    return render(request, 'app-emails.html', page_context)

def _get_analytics(deployment_id):
    """
        Send a post request to get analytics from the deployment corresponding to deployment_id.
        Then upsert it into the analytics store.
    """
    r = requests.post("http://%s/analytics/%d/" % (settings.DEPLOYMENT_HOSTNAME, deployment_id))
    # HACK to get rid of double quotes.
    analytics_json = '%s' % r.text
    try:
        app = App.objects.get(deployment_id=deployment_id)
    except App.DoesNotExist:
        return
    old_analytics = AnalyticsStore.objects.all().filter(app=app)
    # Create analytics for the app if needed, otherwise update the analytics.
    if len(old_analytics) == 0:
        analytics_store = AnalyticsStore(app=app, owner=app.owner, analytics_json=analytics_json)
        analytics_store.save()
    elif len(old_analytics) == 1:
        old_analytics_store = old_analytics[0]
        old_analytics_store.analytics_json = analytics_json
        old_analytics_store.save()


@require_GET
@login_required
@csrf_exempt
def get_analytics(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if app.deployment_id is None:
        raise Http404
    _get_analytics(app.deployment_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    analytics_data = None
    try:
        analytics_data = AnalyticsStore.objects.get(app=app)
    except AnalyticsStore.DoesNotExist:
        return JSONResponse({})
    data = analytics_data.analytics_data
    return JSONResponse(data)

@login_required
@csrf_exempt
@require_POST
def process_excel(request, app_id):
    app_id = long(app_id)
    file_name = request.FILES['file_name']
    entity_name = request.POST['entity_name']
    fields = request.POST['fields']
    fe_data = {'model_name': entity_name, 'fields': fields}
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    try:
        d = Deployment.objects.get(subdomain=app.subdomain())
    except Deployment.DoesNotExist:
        raise Exception("App has not been deployed yet")
    state = app.get_state()
    xl_data = get_xl_data(file_name)
    app_state_entities = [e['name'] for e in state['entities']]
    for sheet in xl_data:
        add_xl_data(xl_data, fe_data, app_state_entities, d.app_dir + "/db")
    return HttpResponse("ok")


@login_required
@csrf_exempt
@require_POST
def process_user_excel(request, app_id):
    f = request.FILES['file_name']
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    data = {"api_secret": "uploadinG!!"}
    files = {'excel_file': f}
    if settings.DEBUG and not settings.STAGING:
        try:
            r = requests.post(
                "http://localhost:8001/" + "user_excel_import/", data=data, files=files)
        except Exception:
            print "To test excel in dev mode, you have to have the child webapp running on port 8001"
    else:
        r = requests.post(
            app.url() + "user_excel_import/", data=data, files=files)

    return HttpResponse(r.content, status=r.status_code, mimetype="application/json")

from django.forms import ModelForm


class StaticFileForm(ModelForm):

    class Meta:
        model = StaticFile
        exclude = ('app', 'theme')

    def __init__(self, app, *args, **kwargs):
        self.app = app
        super(StaticFileForm, self).__init__(*args, **kwargs)

    def save(self, *args, **kwargs):
        self.instance.app = self.app
        return super(StaticFileForm, self).save(*args, **kwargs)


def JSONResponse(serializable_obj, **kwargs):
    """Just a convenience function, in the middle of horrible code"""
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)


@login_required
def staticfiles(request, app_id):
    if request.method != 'GET' and request.method != 'POST':
        return HttpResponse("Method not allowed", status=405)
    else:
        app_id = long(app_id)
        app = get_object_or_404(App, id=app_id)
        if not request.user.is_superuser and app.owner.id != request.user.id:
            raise Http404
        if request.method == 'GET':
            sf = StaticFile.objects.filter(
                app=app).values('name', 'url', 'type')
            return JSONResponse(list(sf))
        if request.method == 'POST':
            sf_form = StaticFileForm(app, request.POST)
            if sf_form.is_valid():
                sf_form.save()
                return JSONResponse({})
            else:
                return JSONResponse({"error": "One of the fields was not valid."})


@login_required
@require_GET
@csrf_exempt
def app_zip(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    zip_bytes = open(app.zip_path(), "r").read()
    response = HttpResponse(zip_bytes, content_type="application/octet-stream")
    response['Content-Disposition'] = 'attachment; filename="%s.zip"' % app.subdomain
    return response



@login_required
@require_POST
@csrf_exempt
def app_deploy(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    d_user = {
        'user_name': app.owner.username,
        'date_joined': str(app.owner.date_joined)
    }
    result = app.deploy()
    result['zip_url'] = reverse('appcubator.views.app_zip', args=(app_id,))
    status = 500 if 'errors' in result else 200
    return HttpResponse(simplejson.dumps(result), status=status, mimetype="application/json")


@require_POST
@csrf_exempt
def send_hosted_email(request):
    # Need to log IP addresses to ensure we do not get freeloaders
    # that use this as a free service
    from_email = request.POST['from_email']
    to_email = request.POST['to_email']
    subject = request.POST['subject']
    text = request.POST['text']
    html = request.POST['html']
    api_key = request.POST['api_key']
    api_key_count = None
    try:
        api_key_count = ApiKeyCounts.objects.get(api_key=api_key)
    except ApiKeyCounts.DoesNotExist:
        api_new_entry = ApiKeyCounts(api_key=api_key, api_count=0)
        api_new_entry.save()
    if api_key_count is None:
        api_key_count = ApiKeyCounts.objects.get(api_key=api_key)
    # TODO(nkhadke): Make this more sophisticated later on.
    if api_key_count.api_count < 200:
        api_key_count.api_count += 1
        api_use = ApiKeyUses(api_key=api_key_count)
        api_use.save()
        send_email(from_email, to_email, subject, text, html)
        return HttpResponse("Email sent successfully")
    else:
        return HttpResponse("API quota reached")


@require_POST
@csrf_exempt
def check_availability(request, domain):
    domain_is_available = DomainRegistration.check_availability(domain)

    if domain_is_available:
        return JSONResponse(True)
    else:
        return JSONResponse(False)


@require_POST
@login_required
@csrf_exempt
def register_domain(request, domain):
    # Protect against trolls
    assert len(domain) < 50

    # Check domain cap
    if request.user.domains.count() >= DomainRegistration.MAX_FREE_DOMAINS:
        return JSONResponse({"error": 0})

    # Try to register
    try:
        d = DomainRegistration.register_domain(
            domain, test_only=settings.DEBUG)
    except Exception, e:
        return JSONResponse({"errors": str(e)})

    # TODO afterwards in a separate worker
    d.configure_dns(domain, staging=settings.STAGING)

    # Give client the domain info
    return JSONResponse(d.domain_info)


@require_POST
@login_required
@csrf_exempt
def sub_check_availability(request, subdomain):
    domain_is_available = not App.objects.filter(subdomain=subdomain.lower()).exists()

    if domain_is_available:
        return JSONResponse(True)
    else:
        return JSONResponse(False)


@require_POST
@login_required
@csrf_exempt
def sub_register_domain(request, app_id, subdomain):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    app.subdomain = subdomain
    app.full_clean()
    app.save(state_version=False)
    d_user = {
        'user_name': app.owner.username,
        'date_joined': str(app.owner.date_joined)
    }
    result = app.deploy(d_user)
    status = 500 if 'errors' in result else 200
    return HttpResponse(simplejson.dumps(result), status=status, mimetype="application/json")


def yomomma(request, number):
    r = requests.get("http://www.jokes4us.com/yomamajokes/random/yomama"+number+".html")
    return HttpResponse(r.text, status=r.status_code)

def webgeekjokes(request):
    r = requests.get("http://www.webgeekjokes.tumblr.com/random")
    return JSONResponse(r.text)

