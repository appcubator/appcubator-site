from models import App
from django import forms
import re


class AppNew(forms.ModelForm):

    class Meta:
        model = App
        fields = ('name', 'owner', 'subdomain')

    name = forms.CharField(max_length=40)
    subdomain = forms.CharField(max_length=40)

    def clean_subdomain(self):
        subdomain = self.cleaned_data['subdomain']
        # trim whitespace and lowercase
        subdomain = subdomain.strip().lower()
        # replace junk with hyphens
        subdomain = re.sub(r'[^0-9a-z]', '-', subdomain)
        # collect together runs of hyphens
        subdomain = re.sub(r'\-+', '-', subdomain)
        # hyphens can't occur at beginning or end
        subdomain = re.sub(r'^\-', '', subdomain)
        subdomain = re.sub(r'\-$', '', subdomain)
        # trim if too long
        subdomain = subdomain[:min(len(subdomain), 40)]
        self.cleaned_data['subdomain'] = subdomain
        return subdomain

    def clean_name(self):
        "Prevent duplicate naming of apps"
        if App.objects.filter(name__iexact=self.cleaned_data['name']).exists():
            raise forms.ValidationError("You already have an app with this name. Please choose a new one.")
        return self.cleaned_data['name']
