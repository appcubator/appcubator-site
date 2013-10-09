from django.db import models
from appcubator.models import App


"""
Providers, their keys, their values

Provider and ProviderKey are initialized in a migration
  which loads the data from a fixture:

    from django.core.management import call_command
    call_command('loaddata', 'providers.json')


Display name is what the user will see
Internal name is what codegen expects to see

"""


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
