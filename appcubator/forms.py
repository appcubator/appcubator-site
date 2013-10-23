from django.contrib.comments.forms import CommentSecurityForm
from django.contrib.contenttypes.models import ContentType

import models
from models import App
from django import forms

MAX_FREE_APPS = 5

class AppLimitReached(forms.ValidationError):
    """ Raised when free user tries to create an app above free limit """

    def __init__(self):
        super(AppLimitReached, self).__init__("<a href=\"/account/\">Upgrade to the premium plan to make more apps.</a>")

class AppNew(forms.ModelForm):

    class Meta:
        model = App
        fields = ('name', 'owner', 'subdomain')

    name = forms.CharField(max_length=40)
    subdomain = forms.CharField(max_length=40, min_length=1)

    def __init__(self, *args, **kwargs):
        self.owner=kwargs.pop('owner', None) # needed for validation of name later on
        super(AppNew, self).__init__(*args, **kwargs)

    def clean_subdomain(self):
        subdomain = self.cleaned_data['subdomain']

        subdomain = App.provision_subdomain(subdomain)

        self.cleaned_data['subdomain'] = subdomain
        return subdomain

    def clean_name(self):
        "Prevent duplicate naming of apps"
        if App.objects.filter(owner=self.owner, name__iexact=self.cleaned_data['name']).exists():
            raise forms.ValidationError("You already have an app with this name. Please choose a new one.")
        return self.cleaned_data['name']

    def clean(self):
        owner = self.owner


        paying = False
        try: # this poor code was written b/c idk where to import CurrentSubscription from to see if (class).DoesNotExist is raised. This might get raised b/c some customers don't have current subscription. No idea why this is the case.
            if owner.customer.current_subscription.plan != 'free':
                paying = True
        except Exception:
            paying = False

        if owner.apps.count() >= MAX_FREE_APPS and not paying:
            raise AppLimitReached()
        return self.cleaned_data

class AppClone(forms.Form):
    app = forms.ModelChoiceField(queryset=App.objects.all())

    def clean(self):
        app = self.cleaned_data['app']
        paying = False
        try: # this poor code was written b/c idk where to import CurrentSubscription from to see if (class).DoesNotExist is raised. This might get raised b/c some customers don't have current subscription. No idea why this is the case.
            if app.owner.customer.current_subscription.plan != 'free':
                paying = True
        except Exception:
            paying = False

        if app.owner.apps.count() >= MAX_FREE_APPS and not paying:
            raise AppLimitReached()
        return self.cleaned_data

    def save(self):
        app = self.cleaned_data['app']
        app_clone = app.clone()
        return app_clone


class ChangeSubdomain(forms.Form):
    subdomain = forms.CharField(max_length=40)

    def clean_subdomain(self):
        "Validate that it's clean and case-insensitive unique"
        subdomain = self.cleaned_data['subdomain'].lower()
        cleaned = models.clean_subdomain(subdomain)
        if subdomain != cleaned:
            raise forms.ValidationError("Subdomain invalid, subdomain vs cleaned: %r" % ((subdomain, cleaned),))
        if App.objects.filter(subdomain__iexact=subdomain).exists():
            raise forms.ValidationError("Subdomain taken")
        return subdomain

    def __init__(self, data, app=None, *args, **kwargs):
        super(ChangeSubdomain, self).__init__(data, *args, **kwargs)
        self.app = app

    def save(self, **kwargs):
        assert self.app is not None, "Must init this form with an app to change subdomain of."
        self.app.subdomain = self.cleaned_data['subdomain']
        self.app.save(**kwargs)
        return self.app


class ToggleLoveForm(CommentSecurityForm):
    def get_filter_kwargs(self):
        return {
            'content_type': ContentType.objects.get_for_model(self.target_object),
            'object_pk': self.target_object._get_pk_val(),
        }
