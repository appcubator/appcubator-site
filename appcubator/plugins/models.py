import os, os.path
join = os.path.join
import sys

import simplejson
import traceback

from django.db import models
from appcubator.models import App, User

from appcubator.default_data import DEFAULT_STATE_DIR, get_default_data

"""
Providers, their keys, their values

Provider and ProviderKey are initialized in a migration
  which loads the data from a fixture:

    from django.core.management import call_command
    call_command('loaddata', 'providers.json')


Display name is what the user will see
Internal name is what codegen expects to see

"""

def load_initial_plugins():
    theme_json_filenames = os.listdir(
        os.path.join(DEFAULT_STATE_DIR, "plugins"))

    for filename in theme_json_filenames:
        if not filename.endswith('json'):
            continue
        try:
            sys.stdout.write("Loading %s" % filename)
            s = simplejson.loads(get_default_data(
                os.path.join("plugins", filename)))
            sys.stdout.write(".")
            # assert 'lines' in s
            t = Plugin(name=filename.replace(".json", ""), description="Dummy description", guide="This is how to use it -.-")
            sys.stdout.write(".")
            t.set_data(s)
            sys.stdout.write(".")
            t.save()
            sys.stdout.write(".")
            print ""
        except Exception:
            # don't crash if one theme fails
            print "\nError with %s" % filename
            traceback.print_exc()


# -
# Plugin Model

class Plugin(models.Model):
    name = models.CharField(max_length=100, default='')
    owner = models.ForeignKey(User, related_name='plugins', blank=True, null=True)

    # set on save and deploy calls.
    description = models.TextField(max_length=255, blank=True, default='')
    guide = models.TextField(max_length=255, blank=True, default='')

    created_on = models.DateTimeField(auto_now_add=True)

    _data_json = models.TextField(blank=True, default='')

    def get_data(self):
        return simplejson.loads(self._data_json)

    def set_data(self, val):
        self._data_json = simplejson.dumps(val)

    state = property(get_data, set_data)

    def to_dict(self):
        try:
            owner = self.owner.username
        except:
            owner = 'Appcubator Team'

        return {'name': self.name,
                'owner': owner,
                'description': self.description,
                'guide': self.guide,
                'data': self._data_json }


class Provider(models.Model):
    """
    Examples include Facebook, Google, Paypal
    """
    display_name = models.CharField(max_length=255)
    internal_name = models.CharField(max_length=255)
    url = models.URLField()
    img = models.URLField()


class ProviderKey(models.Model):
    """
    Ie, FACEBOOK APP SECRET KEY

    Related to the Provider to which it belongs
    """
    provider = models.ForeignKey(Provider)
    display_name = models.CharField(max_length=255)
    internal_name = models.CharField(max_length=255)
    description = models.CharField(max_length=255)


class ProviderData(models.Model):
    """
    Ie, providerkey 3 = alsdkjfldsjkflsdkfjldsjfk

    Related to the app, and the provider key which it's an instance of
    """
    app = models.ForeignKey(App)
    provider_key = models.ForeignKey(ProviderKey)
    value = models.CharField(max_length=255)


def copy_provider_data(app1, app2, overwrite=False):
    """ Copy plugin data from app1 to app2
          if overwrite=true, Overwrites existing plugin data on app1 """

    for pd1 in app1.providerdata_set.all():

        # don't overwrite provider_key data if already exists on app2
        if not overwrite and app2.providerdata_set.filter(provider_key=pd1.provider_key).exists():
            continue

        pd2 = ProviderData(app=app2,
                          provider_key=pd1.provider_key,
                          value=pd1.value)
        pd2.save()
