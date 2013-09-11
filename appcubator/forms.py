import models
from models import App
from django import forms
import re
import random


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

