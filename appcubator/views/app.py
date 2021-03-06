from django.http import HttpResponse, Http404
from . import JsonResponse

from django.shortcuts import redirect, render, get_object_or_404
from django.core.urlresolvers import reverse
from django.core.exceptions import ValidationError
from django.template import loader, Context

from django.contrib.auth.decorators import login_required
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET, require_POST

from django.contrib import messages

from django.forms import ModelForm

import re
import requests
import nltk
import json

import os, os.path
join = os.path.join

from appcubator.email.sendgrid_email import send_email, send_template_email
from appcubator.our_payments.views import is_stripe_customer#, subscribe

from appcubator.models import App, ApiKeyUses, ApiKeyCounts, LogAnything, InvitationKeys, AnalyticsStore, User, Collaboration, CollaborationInvite
from appcubator.models import DomainRegistration
from appcubator.themes.models import StaticFile, UITheme
from appcubator.plugins.models import Plugin, load_initial_plugins

from appcubator.default_data import DEFAULT_STATE_DIR, get_default_mobile_uie_state, get_default_uie_state, get_default_app_state
from appcubator import forms
from appcubator import codegen

from django.conf import settings

def add_statics_to_context(context, app):
    context['statics'] = json.dumps(list(
        StaticFile.objects.filter(app=app).values()))
    return context


APP_TEMPLATES = { "socialnetwork": "",
                  "marketplace": "",
                  "tutoringsite": "" # list the templates here, they get initialized below.
                  }

for templname in APP_TEMPLATES:
    with open(join(DEFAULT_STATE_DIR, 'apps', "%s.json" % templname)) as f:
        r = json.load(f)
    APP_TEMPLATES[templname] = r



@require_GET
@login_required
def welcome(request):

    # case for turning noob mode off
    if request.user.extradata.noob:
        if request.user.apps.count() > 0 or request.user.collaborations.count() > 0:
            e = request.user.extradata
            e.noob = 0
            e.save()
            return redirect(user_page, request.user.username)

    if request.user.apps.count() == 0:
        return redirect(new)


    return redirect(user_page, request.user.username)


def user_page(request, username):
    if request.user.username != username:
        return redirect("/")

    # case for turning noob mode off
    if request.user.extradata.noob:

        if request.user.apps.count() > 0 and is_stripe_customer(request.user):
            e = request.user.extradata
            e.noob = 0
            e.save()

    if request.user.apps.count() == 0:
        if request.user.collaborations.count() == 0:
            return redirect(new)
        else:
            latest_app = request.user.collaborations.latest('created_on').app
    else:
        latest_app = request.user.apps.latest('created_on')


    return dashboard(request, str(latest_app.id))

def dashboard(request, app_id):
    # render dashboard
    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]

    page_context = {'title'        : 'Dashboard',
                    'themes'       : json.dumps(list(themes)),
                    'mobile_themes': json.dumps(list(mobile_themes)),
                    'apps'         : request.user.apps.all(),
                    'collab_apps'  : [c.app for c in request.user.collaborations.all()]
                    }

    app_id = long(app_id)
    # id of 0 is reserved for sample app
    if(app_id == 0):
        return redirect(welcome)

    page_context['app_id'] = app_id

    return render(request, 'app-dashboard.html', page_context)


def new_template(request, template_name):
    return new(request, app_template=template_name)

@login_required
def new(request, is_racoon = False, app_template=None):
    """
    app_template only used for POST request
    """
    if request.method == 'GET':
        #log url route
        user_id = request.user.id
        app_id = 0
        log = LogAnything(user_id=user_id, app_id=app_id, name="visited page", data={"page_name": "newapp"})
        log.save()

        page_context = {'apps' : request.user.apps.all() }

        return render(request, 'apps-new.html', page_context)

    elif request.method == 'POST':
        if app_template is not None and app_template not in APP_TEMPLATES:
            raise Http404

        data = {}
        data['name'] = request.POST.get('name', '')
        data['owner'] = request.user.id

        # use this short username
        data['subdomain'] = "%s-%s" % (request.user.username, request.POST.get('name', ''))

        # dev modifications
        if settings.DEBUG:
            data['subdomain'] = 'dev-' + data['subdomain']

        form = forms.AppNew(data, owner=request.user)

        if form.is_valid():
            app = form.save(commit=False)
            if app_template is not None:
                # initialize the state w a template
                s = APP_TEMPLATES[app_template]
            else:
                s = app.state
            s['name'] = app.name
            app.state = s
            app.save()

            # refetch from the db. this is a weird hack that makes deploy magically work.
            app = App.objects.get(pk=app.id)
            try:
                app.get_deployment_if_not_exists()
            except Exception, e:
                app.delete()
                import traceback
                traceback.print_exc()
                return HttpResponse("Sorry for the inconvenience, but the deployment system is down. Please contact founders@appcubator.com and we'll get it back up immediately.", status=500)

            return redirect(page, app.pk)

        return render(request,  'apps-new.html', {'old_name': request.POST.get('name', ''), 'other_errors': form.non_field_errors, 'errors': dict(form.errors)}, status=400)
    else:
        return HttpResponse(status=405)


@login_required
@require_POST
def clone(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)

    form = forms.AppClone({ "app": app_id })
    if form.is_valid():

        new_app = form.save()
        print "new app: %d" % new_app.id
        new_app._uie_state_json = app._uie_state_json
        new_app._state_json = app._state_json

        new_app.save()

        # this adds it to the deployment queue. non-blocking basically.
        new_app = App.objects.get(pk=new_app.id)
        #new_app.deploy()

        return redirect(welcome)
    else:
        if request.is_ajax():
            return JsonResponse(form.errors, status=400)
        for k, v in form.errors.iteritems():
            for message in v:
                messages.error(request, message)
        return redirect(user_page, request.user.username)


@login_required
def new_walkthrough(request, walkthrough):
    app_name = "Twitter Demo"
    a = App(name=app_name, owner=request.user, subdomain=App.provision_subdomain('%s-walkthrough' % request.user.username))
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

    return redirect(page, a.id)


@require_GET
@login_required
def page(request, app_id, page_name="overview"):
    app_id = long(app_id)
    # id of 0 is reserved for sample app
    if(app_id == 0):
        return redirect(welcome)

    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]

    page_context = {'app'          : app,
                    'title'        : 'The Garage',
                    'themes'       : json.dumps(list(themes)),
                    'mobile_themes': json.dumps(list(mobile_themes)),
                    'apps'         : app.owner.apps.all(),
                    'user'         : app.owner,
                    'page_name'    : page_name,
                    'is_deployed'  : 1 if app.deployment_id != None else 0,
                    'display_garage' : False}
    add_statics_to_context(page_context, app)
    return render(request, 'app-show.html', page_context)


@require_GET
@login_required
def jsoneditor(request, app_id, page_name="overview"):
    app_id = long(app_id)
    # id of 0 is reserved for sample app
    if(app_id == 0):
        return redirect(welcome)

    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]

    page_context = {'app'          : app,
                    'title'        : 'The Garage',
                    'themes'       : json.dumps(list(themes)),
                    'mobile_themes': json.dumps(list(mobile_themes)),
                    'apps'         : app.owner.apps.all(),
                    'user'         : app.owner,
                    'page_name'    : page_name,
                    'is_deployed'  : 1 if app.deployment_id != None else 0,
                    'display_garage' : False}
    add_statics_to_context(page_context, app)
    return render(request, 'app-jsoneditor.html', page_context)
 
@require_GET
@login_required
def plugineditor(request, app_id):
    app_id = long(app_id)
    # id of 0 is reserved for sample app
    if(app_id == 0):
        return redirect(welcome)

    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]

    page_context = {'app'          : app,
                    'user'         : app.owner,
                    'CODEGEN_URL'  : settings.CODEGEN_ADDR + '/',
                    'DEBUG'        : settings.DEBUG,
                    'CODEGEN_STATICS_URL': settings.CODEGEN_STATICS_URL}
    add_statics_to_context(page_context, app)
    return render(request, 'app-plugin-editor.html', page_context)

@require_GET
def app_editor_iframe(request, app_id, page_name="overview"):
    app_id = long(app_id)
    # id of 0 is reserved for sample app
    if(request.user.is_authenticated is False):
        return redirect(user_page, request.user.username)

    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]

    page_context = {'app'          : app,
                    'title'        : 'The Garage',
                    'themes'       : json.dumps(list(themes)),
                    'apps'         : app.owner.apps.all(),
                    'user'         : app.owner,
                    'page_name'    : page_name,
                    'header'       : app.state.get('header', ''),
                    'scripts'      : app.state.get('scripts', ''),
                    'is_deployed'  : 1 if app.deployment_id != None else 0,
                    'display_garage' : False}
    add_statics_to_context(page_context, app)
    return render(request, 'app-editor-iframe.html', page_context)

@login_required
def edit_theme(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    #theme = get_object_or_404(UITheme, pk = theme_id)
    page_context = {'title': 'Current Theme',
                    'appId': long(app_id),
                    'app'  : app,
                    'apps' : app.owner.apps.all(),
                    'navHide': "true",
                    'theme': app._uie_state_json}
    add_statics_to_context(page_context, app)

    return render(request, 'designer-theme-show.html', page_context)

@require_POST
@login_required
def delete(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    app.delete()
    return redirect("/")


@login_required
def state(request, app_id, path=None, validate=True): # note that in the subtree case, path is passed as a positional argument. I couldn't get the named regex kwarg thing to work.
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    if request.method == 'GET':
        state = get_state(request, app)
        return JsonResponse(state)
    elif request.method == 'POST':
        intified_path = []
        if path:
            raw_tree_path = path.split("/")
            for p in raw_tree_path:
                if p.isdigit():
                    p = int(p)
                intified_path.append(p)
        status, data = save_state(request, app, require_valid=validate, tree_path=intified_path)
        return JsonResponse(data, status=status)
    else:
        return HttpResponse("GET or POST only", status=405)


@require_GET
@login_required
def get_state(request, app):
    return app.state


def mod_sub_tree(tree, sub_t, path):
    t = tree
    path = [p for p in path] # deepcopy

    # can't mod the entire thing without a ref to its parent
    if len(path) == 0:
        assert False

    # traverse to the right point in the tree
    # end result is that path is a list w one element
    while len(path) > 1:
        t = t[path.pop(0)]

    # now tree is the direct parent this modifies tree.
    t[path[0]] = sub_t

@require_POST
@login_required
def save_state(request, app, require_valid=True, tree_path=None):
    # if the incoming appState's version_id does not match the
    # db's version_id, the incoming appState is an outdated version
    if tree_path is None: tree_path = []
    if len(tree_path) == 0:
        if require_valid is True and not app.isCurrentVersion(json.loads(request.body)):
            return (409, { "error": "Plz get version %d" % app.state.get('version_id', 0) })

        app._state_json = request.body
    else:
        tree = app.state
        new_sub_tree = json.loads(request.body)
        mod_sub_tree(tree, new_sub_tree, tree_path)

        app._state_json = json.dumps(tree)

    app.state['name'] = app.name
    app.full_clean()

    # require valid => check for valid, potentially raise an error, else continue
    # change? if so log.
    if require_valid:
        try:
            app.parse_and_link_app_state()
        except codegen.UserInputError, e:
            app.save()
            d = e.to_dict()
            return (400, d)
        except Exception, e:
            return (500, {'error': str(e)})

    app.save()
    return (200, {'version_id': app.state.get('version_id', 0)})


@login_required
@csrf_exempt
def invitations(request, app_id):
    user_id = long(request.user.id)
    # get all invitations sent by user {{user_id}}
    if request.method == 'GET':
        invitations = list(InvitationKeys.objects.filter(inviter_id=user_id))
        json = []
        for i in invitations:
            json.append({"invitee": i.invitee, "date": str(i.date.date()), "accepted": i.accepted})
        return JsonResponse(json)
    # send an invitation from {{user_id}} to a friend
    else:
        user = get_object_or_404(User, pk=user_id)
        app = get_object_or_404(App, pk=long(app_id))
        if user.first_name != "":
            user_name = user.first_name
            if user.last_name is not "":
                user_name = user_name + " " + user.last_name
        else:
            user_name = user.username
        name = request.POST['name']
        email = request.POST['email']
        subject = "%s has invited you to check out Appcubator!" % user_name
        invitation = InvitationKeys.create_invitation(request.user, email)

        message = ('Dear {name},\n\n'
                   'Check out what I\'ve build using Appcubator:\n\n'
                   '<a href="{url}">{hostname}</a>\n\n'
                   'Appcubator is the only visual web editor that can build rich web applications without hiring a developer or knowing how to code. It is also free to build an app, forever.\n'
                   'You can signup here: <a href="http://appcubator.com/signup?k={invitation_key}">Appcubator Signup</a>\n\n'
                   'Best,\n{user_name}\n\n\n')

        message = message.format(name=name, url=app.url(), hostname=app.hostname(), user_name=user_name, invitation_key=invitation.api_key)
        template_context = { "text": message }
        send_template_email(request.user.email, email, subject, "", "emails/base_boxed_basic_query.html", template_context)
        return HttpResponse(message)

def documentation_page(request, page_name):
    try:
        if page_name == "feedback" and request.user.is_authenticated():
            page_name = "feedback-form-page"
        htmlString = render(request, 'documentation/html/'+page_name+'.html').content

        if page_name == "all":
            htmlString = "all"
    except Exception:
        htmlString = "all"

    print htmlString
    data = {
        'content': htmlString,
        'page_name': page_name
    }
    return render(request, 'documentation/documentation-base.html', data)

def documentation_search(request):
    query = request.GET.get('q', '').strip()
    if query == '':
        return redirect(documentation_page)

    # FIXME not safe
    query = query.replace(' ',"|")
    query_regex = re.compile('%s'%query)

    results = []
    # search each file and if exists a match, add to list of results.
    for docfile in os.listdir(settings.DOCUMENTATION_SEARCH_DIR):
        # read the file
        with open(os.path.join(settings.DOCUMENTATION_SEARCH_DIR, docfile), 'r') as curr_file:
            raw_html = curr_file.read()

        # tokenize
        text = nltk.clean_html(raw_html)
        tokens = nltk.word_tokenize(text)

        # find query-token matches
        count = 0
        for t in tokens:
            if(re.match(query_regex, t)):
                count += 1

        # if matches -> add this doc entry to the results
        if count > 0:
            title = text.split('\n')[0]
            excerpt = "%s..." % text[len(title):140]

            d = {}
            d['filename'] = docfile.replace('.html','')
            d['title'] = title
            d['content'] = excerpt
            d['count'] = count
            results.append(d)

    # sort and display results
    sorted_results = sorted(results, key=lambda r: r['count'], reverse=True)
    return render(request, 'documentation/documentation-base.html', {'results': sorted_results})

@login_required
def uie_state(request, app_id):
    app = get_object_or_404(App, id=app_id)
    
    if not app.is_editable_by_user(request.user):
        raise Http404
    if request.method == 'GET':
        state = get_uie_state(request, app)
        return JsonResponse(state)
    elif request.method == 'POST':
        status, message = save_uie_state(request, app)
        return HttpResponse(message, status=status)
    else:
        return HttpResponse("GET or POST only", status=405)


@login_required
def mobile_uie_state(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    if request.method == 'GET':
        state = get_uie_state(request, app)
        return JsonResponse(state)
    elif request.method == 'POST':
        status, message = save_mobile_uie_state(request, app)
        return HttpResponse(message, status=status)
    else:
        return HttpResponse("GET or POST only", status=405)


@csrf_exempt
def less_sheet(request, app_id, isMobile=False):
    print app_id
    if long(app_id) == 0:
        print "YOLO"
        return default_less_sheet(request)

    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    less_string = app.css(deploy=False, mobile=isMobile)
    css_string = codegen.less(less_string)
    return HttpResponse(css_string, mimetype='text/css')

@csrf_exempt
def mobile_less_sheet(request, app_id):
    return less_sheet(request, app_id, True)

@csrf_exempt
def default_less_sheet(request):
    t = loader.get_template('app-editor-css-gen.html')
    uie_state = json.loads(get_default_uie_state())
    context = Context({'uie_state': uie_state,
                       'isMobile': False,
                       'deploy': False})
    less_string = t.render(context)
    css_string = codegen.less(less_string)
    return HttpResponse(css_string, mimetype='text/css')

@csrf_exempt
def css_sheet(request, app_id, isMobile=False):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    uie_state = app.uie_state
    if isMobile:
        uie_state = app.mobile_uie_state

    context = Context({'uie_state': uie_state,
                       'isMobile': False,
                       'deploy': False})
    t = loader.get_template('app-editor-css-gen.html')
    less_string = t.render(context)
    css_string = codegen.less(less_string)

    return HttpResponse(css_string, mimetype='text/css')



@csrf_exempt
def theme_css_sheet(request, theme_id):
    theme_id = long(theme_id)
    theme = get_object_or_404(UITheme, id=theme_id)

    uie_state = theme.uie_state

    context = Context({'uie_state': uie_state,
                       'isMobile': False,
                       'deploy': False})
    t = loader.get_template('app-editor-css-gen.html')
    less_string = t.render(context)
    css_string = codegen.less(less_string)

    return HttpResponse(css_string, mimetype='text/css')


@csrf_exempt
def mobile_css_sheet(request, app_id):
    return css_sheet(request, app_id, True)


@require_GET
@login_required
def get_uie_state(request, app):
    return app.uie_state


@require_POST
@login_required
def save_uie_state(request, app):
    app._uie_state_json = request.POST['uie_state']
    try:
        app.full_clean()
    except Exception, e:
        return (400, str(e))
    app.save()
    return (200, 'ok')


@require_POST
@login_required
def save_mobile_uie_state(request, app):
    app._mobile_uie_state_json = request.POST['uie_state']
    try:
        app.full_clean()
    except Exception, e:
        return (400, str(e))
    app.save()
    return (200, 'ok')


def emails(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    page_context = {'app': app, 'title': 'Emails', 'app_id': app_id}
    return render(request, 'app-emails.html', page_context)

def _get_analytics(deployment_id):
    """
        Send a post request to get analytics from the deployment corresponding to deployment_id.
        Then upsert it into the analytics store.
        TODO FIX THIS
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
    """
    pass

@require_GET
@login_required
@csrf_exempt
def get_analytics(request, app_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if app.deployment_id is None:
        raise Http404

    _get_analytics(app.deployment_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    analytics_data = None
    try:
        analytics_data = AnalyticsStore.objects.get(app=app)
    except AnalyticsStore.DoesNotExist:
        return JsonResponse({})
    data = analytics_data.analytics_data
    return JsonResponse(data)


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


@login_required
def staticfiles(request, app_id):
    if request.method != 'GET' and request.method != 'POST':
        return HttpResponse("Method not allowed", status=405)
    else:
        app_id = long(app_id)
        app = get_object_or_404(App, id=app_id)
        if not app.is_editable_by_user(request.user):
            raise Http404
        if request.method == 'GET':
            sf = StaticFile.objects.filter(
                app=app).values('name', 'url', 'type')
            return JsonResponse(list(sf))
        if request.method == 'POST':
            sf_form = StaticFileForm(app, request.POST)
            if sf_form.is_valid():
                sf_form.save()
                return JsonResponse({})
            else:
                return JsonResponse({"error": "One of the fields was not valid."})

@login_required
def delete_static(request, app_id, static_id):
    app_id = long(app_id)
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    sf = StaticFile.objects.filter(pk = static_id, app=app)
    sf.delete()
    return HttpResponse("ok")


@login_required
@require_GET
@csrf_exempt
def app_zip(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    # AJAX this route to do validate (returns 200 or 409)
    try:
        app.parse_and_link_app_state()
    except codegen.UserInputError, e:
        d = e.to_dict()
        return JsonResponse(d, status=400)

    # browser GET this route to download the file
    zip_bytes = app.zip_bytes()
    response = HttpResponse(zip_bytes, content_type="application/octet-stream")
    response['Content-Disposition'] = 'attachment; filename="%s.zip"' % app.subdomain
    return response


@login_required
@require_POST
@csrf_exempt
def deploy(request, app_id):
    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404
    app.full_clean()

    try:
        app.parse_and_link_app_state()
        result = {}
        result['site_url'] = app.url()
        result['zip_url'] = reverse('appcubator.views.app.app_zip', args=(app_id,))
        data = app.deploy()
    except codegen.UserInputError, e:
        d = e.to_dict()
        return JsonResponse(d, status=400)

    return JsonResponse(result)


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
        return JsonResponse(True)
    else:
        return JsonResponse(False)


@require_POST
@login_required
@csrf_exempt
def sub_check_availability(request, subdomain):
    data = {'subdomain': subdomain}
    form = forms.ChangeSubdomain(data)
    if form.is_valid():
        return JsonResponse(True)
    return JsonResponse(False)


@require_POST
@login_required
@csrf_exempt
def sub_register_domain(request, app_id, subdomain):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404
    form = forms.ChangeSubdomain({'subdomain': subdomain}, app=app)
    if form.is_valid():
        # the below line calls the model's save method, which will update deployment server automatically.
        app = form.save()
        return HttpResponse(json.dumps({}), status=200, mimetype="application/json")

    return HttpResponse(json.dumps(form.errors), status=400, mimetype="application/json")

@require_POST
@login_required
def hookup_custom_domain(request, app_id, domain):
    app = get_object_or_404(App, id=app_id)
    if not request.user.is_superuser and app.owner.id != request.user.id:
        raise Http404

    def is_valid_hostname(hostname):
        if len(hostname) > 255:
            return False
        if hostname[-1] == ".":
            hostname = hostname[:-1] # strip exactly one dot from the right, if present
        allowed = re.compile("(?!-)[A-Z\d-]{1,63}(?<!-)$", re.IGNORECASE)
        return all(allowed.match(x) for x in hostname.split("."))

    if is_valid_hostname(domain):
        app.custom_domain = domain
        app.save()
        return JsonResponse({})
    else:
        return JsonResponse({}, status=400)

# this is old.
@require_POST
@login_required
@csrf_exempt
def register_domain(request, domain):
    # Protect against trolls
    assert len(domain) < 50

    # Check domain cap
    if request.user.domains.count() >= DomainRegistration.MAX_FREE_DOMAINS:
        return JsonResponse({"error": 0})

    # Try to register
    try:
        d = DomainRegistration.register_domain(
            domain, test_only=settings.DEBUG)
    except Exception, e:
        return JsonResponse({"errors": str(e)})

    # TODO afterwards in a separate worker
    d.configure_dns(domain, staging=settings.STAGING)

    # Give client the domain info
    return JsonResponse(d.domain_info)

@require_POST
@login_required
def add_or_remove_collaborators(request, app_id, method="POST"):
    assert method in ['POST', 'DELETE']

    app = get_object_or_404(App, id=app_id)
    if not app.is_editable_by_user(request.user):
        raise Http404

    resp = redirect(user_page, request.user.username)

    # get the email field out of the request
    try:
        email = request.POST.get("email", "")
    except (KeyError, IndexError):
        messages.error(request, "Something went wrong. Please contact team@appcubator.com about this.")
        return resp

    # get user by email or username
    try:
        user = User.objects.get(email=email)
    except User.DoesNotExist:
        try:
            user = User.objects.get(username=email)
        except User.DoesNotExist:
            if method == 'POST':
                subject = "%s invited you to collaborate on a website" % request.user.get_full_name()
                invitation = InvitationKeys.create_invitation(request.user, email)

                message = ('Hi there,\n\n'
                           'I\'m working on a website:\n\n'
                           '<a href="{url}">{hostname}</a>\n\n'
                           'And I could use your help. I\'ve built it on Appcubator, a visual way to build rich web applications.\n'
                           'You can signup here: <a href="http://appcubator.com/signup?k={invitation_key}">Signup link</a>\n'
                           'Once you sign up, you\'ll automatically be added as a collaborator to the project.\n'
                           'Thank you!\n{user_name}\n\n\n')
                message = message.format(url=app.url(), hostname=app.hostname(), user_name=request.user.get_full_name(), invitation_key=invitation.api_key)

                send_template_email(request.user.email, email, subject, "", "emails/base_boxed_basic_query.html", { "text": message })

                collabinvite = CollaborationInvite(invite_key=invitation.api_key,
                                                   email=email,
                                                   inviter=request.user,
                                                   app=app)
                collabinvite.save()
                messages.info(request, "%s was invited to collaborate." % email)
                return resp

            elif method == 'DELETE':
                try:
                    ci = CollaborationInvite.objects.get(email=email)
                except CollaborationInvite.DoesNotExist:
                    # This can't happen unless someone's playing tricks with the api.
                    # todo log this event
                    raise
                ci.delete()
                messages.info(request, "Removed collaboration invite.")
                return resp


    if method == 'POST':
        add_collaborator_to_app(request, app, user)

    elif method == 'DELETE':
        remove_collaborator_from_app(request, app, user)
    return resp

@require_POST
@login_required
def add_collaborator_to_app(request, app, collab_user):
    success = app.add_user_as_collaborator(collab_user)

    if success:
        messages.info(request, "@%s was added as a collaborator." % collab_user.username)
        return True
    else:
        messages.error(request, "This user is already a collaborator.")
        return False


@require_POST
@login_required
def remove_collaborator_from_app(request, app, collab_user):
    try:
        collab = get_object_or_404(Collaboration, app=app, user=collab_user)
    except Http404:
        messages.error(request, "This user is not a collaborator.")
        return False

    collab.delete()
    messages.info(request, "Successfully removed collaborator.")
    return True


def plugins(request):
    plugins = Plugin.objects.all()

    if len(plugins) is 0:
        load_initial_plugins()
        plugins = Plugin.objects.all()

    plugins = [p.to_dict() for p in plugins]
    
    return HttpResponse(json.dumps(list(plugins)), status=200, mimetype="application/json")
