from django.views.decorators.http import require_GET, require_POST, require_http_methods
from django.views.decorators.csrf import csrf_exempt, csrf_protect
from django.views.decorators.cache import cache_page
from django.contrib.auth.decorators import login_required
from django.db import models

from django.http import HttpResponse, Http404, HttpResponseRedirect
from django.shortcuts import redirect,render, get_object_or_404
from django.contrib.auth import forms as auth_forms, authenticate, login
from django.core.exceptions import ValidationError
from django import forms
from django.conf import settings
from django.utils import simplejson
from copy import deepcopy

from appcubator.models import User, Customer, InvitationKeys
from appcubator.themes.models import UITheme
from appcubator.default_data import get_default_uie_state, get_default_mobile_uie_state, get_default_app_state
import appcubator.models

from models import Love, Document

from appcubator.email.sendgrid_email import send_template_email
from forms import ToggleLoveForm

import re
import os, os.path
join = os.path.join

def JsonResponse(serializable_obj, **kwargs):
    """Just a convenience function, in the middle of horrible code"""
    return HttpResponse(simplejson.dumps(serializable_obj), mimetype="application/json", **kwargs)

def format_full_details(details):
    lines = []
    for k, v in details.items():
        lines.append("{}: {}".format(k, v))
    return '\n'.join(lines)

def five_hundred_test(request, code = 500):
    if code == 500 and not settings.DEBUG:
        raise Exception()
    return render(request, "%d.html"%code)


class MyUserCreationForm(auth_forms.UserCreationForm):
    """Creates a user"""

    class Meta(auth_forms.UserCreationForm.Meta):
        fields = ('username', 'first_name', 'last_name', 'email')

    def __init__(self, *args, **kwargs):
        super(MyUserCreationForm, self).__init__(*args, **kwargs)
        self.fields['first_name'].required = True
        self.fields['last_name'].required = True
        self.fields['email'].required = True


@require_GET
@cache_page(60*5)
@csrf_protect
def aboutus(request):
    page_context = {}
    page_context["title"] = "About Us"
    return render(request, 'website-aboutus.html', page_context)


@require_GET
def changelog(request):
    page_context = {}
    page_context["title"] = "Change Log"
    return render(request, 'website-changelist.html', page_context)


@require_GET
@cache_page(60*5)
@csrf_protect
def homepage(request):
    if request.user.is_authenticated():
        return redirect('/%s/' % request.user.username)

    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-home.html', page_context)


@require_GET
@cache_page(60*5)
@csrf_protect
def community_page(request):

    page_context = {}
    page_context["title"] = "Community"

    return render(request, 'website-community.html', page_context)

@require_GET
@cache_page(60*5)
@csrf_protect
def community_faq_page(request):

    page_context = {}
    page_context["title"] = "Community | FAQ"

    return render(request, 'website-community-faq.html', page_context)


@require_GET
def developer_homepage(request):
    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-home-developer.html', page_context)


@login_required
@csrf_exempt
def account(request):
    if request.method == 'GET':
        page_context = {}
        page_context["title"] = "Account"
        return render(request, 'registration/account.html', page_context)
    elif request.method == 'POST':
        user = request.user
        user.first_name = request.POST['first_name']
        user.last_name = request.POST['last_name']
        user.username = request.POST['username']
        user.email = request.POST['email']
        if user.email == "":
            return HttpResponse(simplejson.dumps({"email": ["Email cannot be blank."]}), mimetype="application/json")
        try:
            user.full_clean()
        except ValidationError, e:
            return HttpResponse(simplejson.dumps(e.message_dict), mimetype="application/json")
        else:
            user.save()
            return HttpResponse(simplejson.dumps({"redirect_to": "/account/"}), mimetype="application/json")


@login_required
@require_POST
def change_password(request):
    password1 = request.POST['password1']
    password2 = request.POST['password2']

    if password1 == "":
        return HttpResponse(simplejson.dumps({"password1": ["Password cannot be blank."]}), mimetype="application/json")

    if password1 != password2:
        return HttpResponse(simplejson.dumps({"password2": ["Passwords do not match."]}), mimetype="application/json")

    user = request.user
    user.set_password(password1)
    user.save()
    return HttpResponse(simplejson.dumps({"redirect_to": "/account/"}), mimetype="application/json")


@require_GET
def tutorial(request):
    page_context = {}
    page_context["title"] = "Tutorial"
    return render(request, 'tutorial-template.html', page_context)


@require_http_methods(["GET", "POST"])
def signup(request):
    if request.method == "GET":
        ik = None
        if 'k' in request.GET:
            api_key = request.GET['k']
            if InvitationKeys.objects.filter(api_key=api_key).exists():
                ik = InvitationKeys.objects.filter(api_key=api_key)[0]
                ik.accepted = True
                ik.save()
        return render(request, "website-signup.html", {"ik": ik})
    else:
        req = {}
        req = deepcopy(request.POST)
        try:
            req["username"] = appcubator.models.email_to_uniq_username(request.POST["email"])
        except Exception:
            req["username"] = request.POST.get("email", "")


        if len(req["username"]) > 30:
            req["username"] = req["username"][:30]

        if " " in request.POST["name"]:
            toks = request.POST["name"].split(" ")
            req["first_name"] = toks[0]
            req["last_name"] = " ".join(toks[1:])
        else:
            req["first_name"] = request.POST["name"]
            req["last_name"] = request.POST["name"]

        form = MyUserCreationForm(req)
        if form.is_valid():
            user = form.save()
            create_customer(request, long(user.pk))
            new_user = authenticate(username=req['username'],
                                    password=req['password1'])
            # Do this via /trigger_customer/ for now.
            # plan_status = set_new_user_plan(new_user)
            # if plan_status is not None:
            #     stripe_error = "We encountered an error with signing you up on your starter plan. Sorry!"
            #     return HttpResponse(simplejson.dumps(stripe_error), mimetype="application/json")
            login(request, new_user)

            ik = req.get('ik', '')
            print ik
            print InvitationKeys.add_collaborations(new_user, ik)

            if request.is_ajax():
                return HttpResponse(simplejson.dumps({"redirect_to": "/app/"}), mimetype="application/json")
            else:
                return redirect('/app/')
        else:
            return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json")

@require_POST
def create_customer(request, user_id):
    data = request.POST.copy()
    data['sign_up_fee'] = '36'
    data['project_description'] = data.get('description', '')
    data['consulting'] = data.get('interest', '')
    data['extra_info'] = data.get('extra', '')
    data['company'] = 'None'
    data['sent_welcome_email'] = True

    form = NewCustomerForm(data)
    if form.is_valid():
        customer = form.save()
        customer.user_id = user_id
        customer.save()
        return True

    return False

def terms_of_service(request):
    page_context = {}
    page_context["title"] = "Homepage"
    return render(request, 'website-tos.html', page_context)


def faq(request):
    page_context = {}
    page_context["title"] = "Homepage"
    return render(request, 'website-faq.html', page_context)


def ping(request):
    return HttpResponse("ok")


def marketing(request):
    page_context = {}
    page_context["title"] = "Homepage"
    return render(request, 'hello.html', page_context)


class NewCustomerForm(forms.ModelForm):
    extra_info = forms.CharField(max_length=255, required=False)
    project_description = forms.CharField(max_length=255, required=False)
    class Meta:
        model = Customer
        fields = ('name', 'email', 'company', 'extra_info', 'consulting', 'project_description', 'sign_up_fee')

@require_POST
@csrf_exempt
def signup_new_customer(request):
    data = request.POST.copy()
    data['sign_up_fee'] = '11'
    data['project_description'] = data.get('description', '')
    data['consulting'] = data.get('interest', '')
    data['extra_info'] = data.get('extra', '')
    form = NewCustomerForm(data)
    if form.is_valid():
        c = form.save()
        return HttpResponse("")

    return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json", status=400)


@login_required
@csrf_exempt
def send_invitation_to_customer(request, customer_pk):
    customer = get_object_or_404(Customer, pk=customer_pk)
    invitation = InvitationKeys.create_invitation(request.user, customer.email)
    text = "Hello! \n Thanks for your interest in Appcubator. You can signup here: http://appcubator.com/signup?k=%s" % invitation.api_key
    subject = "Try out Appcubator!"
    if request.POST['text']:
        text = request.POST['text']
        text = text.replace("SIGNUP_LINK", "<a href='http://appcubator.com/signup?k=%s'>Appcubator | Signup</a>" % invitation.api_key)

    if request.POST['subject']:
        subject = request.POST['subject']

    template_context = {"text": text}
    send_template_email("team@appcubator.com", customer.email, subject, "", "emails/base_boxed_basic_query.html", template_context)
    customer.sent_welcome_email = True
    customer.save()
    return HttpResponse("ok")


@cache_page(60*5)
@csrf_protect
def resources(request):
    page_context = {}
    page_context["title"] = "Resources"
    return render(request, 'website-resources.html', page_context)


def temp_deploy(request):
    # TODO Fix temp deployment
    pass
    """
    td = TempDeployment.find_or_create_temp_deployment(request)
    if request.method == 'GET':
        return HttpResponse(simplejson.dumps({ 'status': td.get_deployment_status() }), mimetype="application/json")
    elif request.method == 'POST':
        old_state = td._state_json
        td._state_json = request.POST['app_state']

        try:
            a = AnalyzedApp.create_from_dict(simplejson.loads(td._state_json), api_key="jdflksjdflkjsdlkfjsdlkj")
        except analyzer.UserInputError, e:
            d = e.to_dict()
            return JsonResponse(d, status=400)

        td.deploy()
        # illusion of not saving.
        td._state_json = old_state
        td.save()
        d = {"site_url": td.url(), "git_url": td.git_url(), "zip_url": ""}
        d = {"site_url": "notyetimplemented.com",
             "git_url": "notyetimplemented.com",
             "zip_url": "notyetimplemented.com"}
        return HttpResponse(simplejson.dumps(d), mimetype="application/json")
        """

@require_GET
@cache_page(60*5)
@csrf_protect
def external_editor(request):
    pass
    """
    td = TempDeployment.find_or_create_temp_deployment(request)
    td.deploy()
    themes = UITheme.get_web_themes()
    themes = [t.to_dict() for t in themes]
    mobile_themes = UITheme.get_mobile_themes()
    mobile_themes = [t.to_dict() for t in mobile_themes]
    page_context = {
        'app' : { 'id': 0},
        'default_state': get_default_app_state(),
        'title': 'My First App',
        'default_mobile_uie_state': get_default_mobile_uie_state(),
        'default_uie_state': get_default_uie_state(),
        'themes': simplejson.dumps(list(themes)),
        'mobile_themes': simplejson.dumps(list(mobile_themes)),
        'statics': simplejson.dumps([]),
    }
    page_context["title"] = "Demo Editor"

    return render(request, 'website-external-editor.html', page_context)
    """

@require_GET
@cache_page(60*5)
@csrf_protect
def external_editor_iframe(request):
    return render(request, 'website-external-iframe.html', {})

@cache_page(60*5)
@csrf_protect
def quickstart(request):
    page_context = {}
    page_context["title"] = "Resources"
    page_context["quickstart"] = True
    return render(request, 'website-resources-quickstart.html', page_context)

def tutorials(request):
    page_context = {}
    page_context["title"] = "Resources"
    page_context["tutorials"] = True
    parts_json_path = join(settings.PROJECT_ROOT_PATH, 'appcubator', 'media', "screencast-text.json")
    with open(parts_json_path) as f:
        parts = simplejson.load(f)
    page_context["parts"] = parts
    return render(request, 'website-resources-tutorials.html', page_context)

@cache_page(60*5)
@csrf_protect
def documentation(request):
    page_context = {}
    page_context["title"] = "Resources"
    page_context["documentation"] = True
    return render(request, 'website-resources-documentation.html', page_context)

@cache_page(60*5)
@csrf_protect
def resources_socialnetwork(request, name=None):
    if name == None:
        raise Http404
    if name not in ["howtosocialnetwork", "custom-code", "get-it-running", "deploy-to-cloud"]:
        raise Http404
    title_d = { "howtosocialnetwork": "Building a Social Network",
                "custom-code": "Writing Custom Code",
                "get-it-running": "Get your Django app Running",
                "deploy-to-cloud": "Deploying to the Cloud"}
    template_d = { "howtosocialnetwork": "website-resources-socialnetwork.html",
                   "custom-code": "website-resources-customcode.html",
                   "get-it-running": "website-resources-getrunning.html",
                   "deploy-to-cloud": "website-resources-deploy.html"}
    num_sections_d = { "howtosocialnetwork": 3,
                       "custom-code": 1,
                       "get-it-running": 1,
                       "deploy-to-cloud": 1}
    page_context = {}
    page_context["title"] = title_d[name]

    def json_to_data(json):
        """"return a list of (section, <section_name>) tuples,
            where each section has a list of dicts
                where each dict has img_url, shortText, longText keys."""
        sections = []
        def slugify(s):
            s = s.lower()
            s = re.sub(r'[^a-z0-9]+', '-', s)
            return s
        for i, entry in enumerate(json):
            if 'section' in entry:
                s = { "data": [],
                      "name": entry['section'],
                      "slideIdx": i,
                      "slug": slugify(entry['section'])
                      }
                sections.append(s)
            sections[-1]['data'].append(entry) # want to append the entry to the last section
        return sections

    page_context["tut_imgs"] = []
    for i in range(num_sections_d[name]):
        profile_json_path = join(settings.PROJECT_ROOT_PATH, 'appcubator', 'media', name, 'p%d.json' % (i+1))
        with open(profile_json_path) as f:
            raw_data = simplejson.load(f)
        page_context["tut_imgs"].append(json_to_data(raw_data))
    return render(request, template_d[name], page_context)

def resources_whatisawebapp(request):
    page_context = {}
    page_context["title"] = "What is a web application?"
    return render(request, 'website-resources-webapps.html', page_context) 

def resources_fordjangodevs(request):
    page_context = {}
    page_context["title"] = "Appcubator for Django Developers"
    return render(request, 'website-resources-fordjangodevs.html', page_context)

def resources_customwidget(request, name=None):
    page_context = {}
    page_context["title"] = "Appcubator for Django Developers"
    return render(request, 'website-resources-customwidget.html', page_context) 


def screencast(request, screencast_id=1):
    page_context = {}
    page_context["title"] = "Screecast " + screencast_id
    return render(request, 'screencast-' + screencast_id + '.html', page_context)

def sample_app(request, sample_id=1):
    page_context = {}
    page_context["title"] = "Sample App " + sample_id
    parts_json_path = join(settings.PROJECT_ROOT_PATH, 'appcubator', 'media', "screencast-text.json")
    with open(parts_json_path) as f:
        parts = simplejson.load(f)
    page_context["parts"] = parts
    return render(request, 'sample-app-' + sample_id + '.html', page_context)

def sample_app_part(request, sample_id=1, part_id=1):
    page_context = {}
    page_context["title"] = "Sample App " + sample_id + ' Part ' + part_id
    return render(request, 'sample-app-' + sample_id + '-part-' + part_id +'.html', page_context)

def designer_guide(request):
    page_context = {}
    page_context["title"] = "Designer Guide"
    return render(request, 'designer-guide.html', page_context)

def designer_guide_old(request):
    page_context = {}
    page_context["title"] = "Designer Guide"
    return render(request, 'designer-guide-old.html', page_context)

def developer_guide(request):
    page_context = {}
    page_context["title"] = "Developer Guide"
    return render(request, 'developer-guide.html', page_context)

def csvusers(request):
    lines = []
    for u in User.objects.all():
        lines.append(u','.join([u.first_name, u.last_name, u.email]))
    if request.is_ajax():
        return HttpResponse(u'\n'.join(lines))
    else:
        return HttpResponse(u'<br>'.join(lines))



@csrf_protect
@require_POST
def toggle_love(request, next=None):
    """
    Toggle love.
    
    """

    data = request.POST.copy()
    
    next = data.get("next", next)
    content_type = data.get("content_type")
    object_pk = data.get("object_pk")

    if content_type == None or object_pk == None:
        return Http404("No object specified.")

    try:
        model = models.get_model(*content_type.split(".", 1))
        target = model.objects.get(pk=object_pk)
    except:
        return Http404("An error occured trying to get the target object.")

    form = ToggleLoveForm(target, data=data)

    if form.security_errors():
        def escape(s):
          return s.replace("<", "&lt;").replace(">", "&gt;")
        return Http404("Form failed security verification:" % escape(str(form.security_errors())))

    # first filter on the object itself
    filters = form.get_filter_kwargs()

    # either add a user or a session key to our list of filters
    if request.user.is_authenticated():
        filters['user'] = request.user
    else:
        filters['session_key'] = request.session.session_key

    # if it exists, delete it; if not, create it.
    try:
        love = Love.objects.get(**filters)
        love.delete()
    except Love.DoesNotExist:
        love = Love(**filters)
        love.save()

    # if a next url is set, redirect there
    if next:
        return HttpResponseRedirect(next)

    # if not, redirect to the original object's permalink
    if target.get_absolute_url is not None:
        return HttpResponseRedirect(target.get_absolute_url())

    # faling both of those, return a 404
    raise Http404('next not passed to view and get_absolute_url not defined on object')


def suggestions(request, sample_id=1):
    
    try:
        suggestions_doc = Document.objects.get(title="Feature Suggestions")
    except Document.DoesNotExist:
        suggestions_doc = Document()
        suggestions_doc.title = "Feature Suggestions"
        suggestions_doc.save()

    page_context = { }
    page_context["object"] = suggestions_doc
    return render(request, 'suggestions.html', page_context)

