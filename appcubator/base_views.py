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

from models import Customer, InvitationKeys
from appcubator.email.sendgrid_email import send_email

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
def homepage(request):
    if request.user.is_authenticated():
        return redirect('/app')

    page_context = {}
    page_context["title"] = "Homepage"

    return render(request, 'website-home.html', page_context)


@login_required
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
            if InvitationKeys.objects.filter(api_key=api_key).count() > 0:
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
            return HttpResponse(simplejson.dumps({'redirect_to': '/'}), mimetype="application/json")
        else:
            return HttpResponse(simplejson.dumps({k: v for k, v in form.errors.items()}), mimetype="application/json")


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


@require_POST
@csrf_exempt
def signup_new_customer(request):
    name = request.POST['name']
    email = request.POST['email']
    company = request.POST['company']
    extra = request.POST['extra']
    interest = request.POST['interest']
    description = request.POST['description']
    Customer.create_first_time(name, email, company, extra, description, 11, interest)
    return HttpResponse("ok")


@login_required
@csrf_exempt
def send_invitation_to_customer(request, customer_id):
    print customer_id
    customer = get_object_or_404(Customer, user_id=customer_id)
    invitation = InvitationKeys.create_invitation(request.user, customer.email)
    text = "Hello! You can signup here: http://appcubator.com/signup?k=%s" % invitation.api_key
    html = text
    send_email("team@appcubator.com", customer.email, "Try out Appcubator!", "", html)
    return HttpResponse("ok")
