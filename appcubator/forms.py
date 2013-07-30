from models import App
from django import forms
import re
import random


def clean_subdomain(subdomain):
    toks = subdomain.split('.')
    if len(toks) > 1:
        subdomain = '.'.join([clean_subdomain(t) for t in toks])
        subdomain = re.sub(r'\.+', '.', subdomain)
        subdomain = re.sub(r'^\.', '', subdomain)
        subdomain = re.sub(r'\.$', '', subdomain)
    else:
        # assume no periods
        # trim whitespace and lowercase
        subdomain = subdomain.strip().lower()
        # replace junk with hyphens
        subdomain = re.sub(r'[^0-9a-z]', '-', subdomain)
        # collect together runs of hyphens and periods
        subdomain = re.sub(r'\-+', '-', subdomain)
        # hyphens or periods can't occur at beginning or end
        subdomain = re.sub(r'^\-', '', subdomain)
        subdomain = re.sub(r'\-$', '', subdomain)
        # trim if too long
        subdomain = subdomain[:min(len(subdomain), 40)]

    # fix if too short
    if len(subdomain) == 0:
        subdomain = "unnamed"

    return subdomain

class AppNew(forms.ModelForm):

    class Meta:
        model = App
        fields = ('name', 'owner', 'subdomain')

    name = forms.CharField(max_length=40)
    subdomain = forms.CharField(max_length=40)

    def clean_subdomain(self):
        subdomain = self.cleaned_data['subdomain']

        subdomain = clean_subdomain(subdomain)

        # prevent duplicate subdomains
        while App.objects.filter(subdomain__iexact=subdomain).exists():
            subdomain += str(random.randint(1,9))

        # the above process may have caused string to grow, so trim if too long
        subdomain = subdomain[-min(len(subdomain), 40):] # take the last min(40, len subdomain) chars.

        self.cleaned_data['subdomain'] = subdomain
        return subdomain

    def clean_name(self):
        "Prevent duplicate naming of apps"
        if App.objects.filter(name__iexact=self.cleaned_data['name']).exists():
            raise forms.ValidationError("You already have an app with this name. Please choose a new one.")
        return self.cleaned_data['name']
