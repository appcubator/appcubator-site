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

from models import Customer, InvitationKeys, AnalyticsStore, App
from appcubator.email.sendgrid_email import send_email, send_template_email

import requests
import re


def format_full_details(details):
    lines = []
    for k, v in details.items():
        lines.append("{}: {}".format(k, v))
    return '\n'.join(lines)


def send_login_notification_message(message):
    return requests.post(
        "https://api.mailgun.net/v2/v1factory.mailgun.org/messages",
        auth=("api", "key-8iina6flmh4rtfyeh8kj5ai1maiddha8"),
        data={
            "from": "v1Factory Bot <postmaster@v1factory.mailgun.org>",
            "to": "team@v1factory.com",
            "subject": "Someone signed on!",
            "text": message}
    )


# Handle requests
@require_POST
@csrf_exempt
def get_linkedin(request):
    r = send_login_notification_message(format_full_details(request.POST))
    return HttpResponse("ok")


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
def homepage(request):
    if request.user.is_authenticated():
        return redirect('/app/')

    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-home.html', page_context)

@require_GET
def homepagenew(request):
    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-home-new.html', page_context)


@require_GET
def showhnpage(request):
    if request.user.is_authenticated():
        return redirect('/app/')

    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-showhn.html', page_context)

@require_GET
def showdnpage(request):
    if request.user.is_authenticated():
        return redirect('/app/')

    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-showdn.html', page_context)

@require_GET
def showgsbpage(request):
    if request.user.is_authenticated():
        return redirect('/app/')

    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-showgsb.html', page_context)

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
        if 'k' in request.GET:
            api_key = request.GET['k']
            if InvitationKeys.objects.filter(api_key=api_key).exists():
                return render(request, "registration/signup.html")
        return render(request, "website-home.html")
    else:
        req = {}
        req = deepcopy(request.POST)
        req["username"] = request.POST["email"]
        req["first_name"] = request.POST["name"].split(" ")[0]
        req["last_name"] = request.POST["name"].split(" ")[-1]
        form = MyUserCreationForm(req)
        if form.is_valid():
            user = form.save()
            new_user = authenticate(username=req['email'],
                                    password=req['password1'])
            login(request, new_user)
            return HttpResponse()
        else:
            return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json")


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
        c = form.save(commit=False)
        c.sent_welcome_email = True
        c.save()
        return HttpResponse("")

    return HttpResponse(simplejson.dumps(form.errors), mimetype="application/json", status=400)

def signup_from(request, src):
    src_company_map = { 'hn': 'Hacker News',
                        'dn': 'Design News',
                        'gsb': 'GSB' }

    src_description_map = { 'hn': 'HN launch',
                            'dn': 'DN launch',
                            'gsb': 'Turkey training' }

    src_template_map = { 'hn': 'website-showhn.html',
                         'dn': 'website-showdn.html',
                         'gsb': 'website-showgsb.html' }

    if request.method == "GET":
        if request.user.is_authenticated():
            return redirect('/app/')
        return render(request, src_template_map[src])
    else:
        req = {}
        req = deepcopy(request.POST)
        req["username"] = request.POST["email"]
        req["first_name"] = request.POST["name"].split(" ")[0]
        req["last_name"] = ' '.join(request.POST["name"].split(" ")[1:])
        user_form = MyUserCreationForm(req)
        req['company'] = src_company_map[src]
        req['extra_info'] = ""
        req['consulting'] = "false"
        req['description'] = src_description_map[src]
        req['sign_up_fee'] = '11'
        cust_form = NewCustomerForm(req)
        if user_form.is_valid() and cust_form.is_valid():
            user = user_form.save()
            c = cust_form.save(commit=False)
            c.sent_welcome_email = True
            new_user = authenticate(username=req['email'],
                                    password=req['password1'])
            login(request, new_user)
            c.user_id = new_user.id
            c.save()
            return HttpResponse("")
        else:
            return HttpResponse(simplejson.dumps(dict(user_form.errors.items() + cust_form.errors.items())), mimetype="application/json")

@require_http_methods(["GET", "POST"])
@csrf_exempt
def signup_from_hn(request):
    return signup_from(request, 'hn')

@require_http_methods(["GET", "POST"])
@csrf_exempt
def signup_from_dn(request):
    return signup_from(request, 'dn')

@require_http_methods(["GET", "POST"])
@csrf_exempt
def signup_from_gsb(request):
    return signup_from(request, 'gsb')

@login_required
@csrf_exempt
def send_invitation_to_customer(request, customer_pk):
    print customer_pk
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


def resources(request):
    page_context = {}
    page_context["title"] = "Resources"
    return render(request, 'resources.html', page_context)


def screencast(request, screencast_id=1):
    page_context = {}
    page_context["title"] = "Screecast " + screencast_id
    return render(request, 'screencast-' + screencast_id + '.html', page_context)
