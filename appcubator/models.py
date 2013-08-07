from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError
from simplejson import JSONDecodeError

import tarfile
import os, os.path
import re
import requests
import simplejson
import traceback
import sys
from datetime import datetime
import time

import subprocess, shlex
import hashlib
import random
import shutil


DEFAULT_STATE_DIR = os.path.join(os.path.dirname(
    __file__), os.path.normpath("default_state"))

import logging
logger = logging.getLogger('appcubator.models')


# ADDITIONAL USER DATA CAN BE STORED HERE
class ExtraUserData(models.Model):
    user = models.OneToOneField(User, related_name="extradata")
    noob = models.IntegerField(default=1)
    technical = models.IntegerField(default=0)
    picture_url = models.URLField(max_length=200, default='/static/default_pic.png')

    # RUN THIS TO FIX AN OLD DATABASE
    @classmethod
    def fix_all_user_profiles(cls):
        for u in User.objects.all():
            try:
                u.extradata
            except cls.DoesNotExist, e:
                cls(user=u, noob=0).save()

from django.db.models.signals import post_save

# AUTOMATICALLY CREATE EXTRADATA ON USER CREATION
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create user profile for new users at save user time, if it doesn't already exist
    """
    try:
        instance.extradata
    except ExtraUserData.DoesNotExist, e:
        ExtraUserData(user=instance).save()

post_save.connect(create_user_profile, sender=User)


def get_default_data(filename):
    f = open(os.path.join(DEFAULT_STATE_DIR, filename))
    s = f.read()
    # makes sure it's actually valid
    simplejson.loads(s)
    f.close()
    return s


def get_default_uie_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "uie_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s

def get_default_mobile_uie_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "mobile_uie_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s

def get_default_app_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "app_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s


def get_default_theme_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "flat_ui_theme.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s

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


class App(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name='apps')

    subdomain = models.CharField(max_length=50, blank=True)

    _state_json = models.TextField(blank=True, default=get_default_app_state)
    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)
    _mobile_uie_state_json = models.TextField(blank=True, default=get_default_mobile_uie_state)

    deployment_id = models.BigIntegerField(blank=True, null=True, default=None)

    def save(self, state_version=True, *args, **kwargs):
        # increment version id
        s = self.state
        if state_version:
            s['version_id'] = s.get('version_id', 0) + 1
        self.state = s

        return super(App, self).save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError
        print "calling clean on %d" % self.id
        if self.owner.apps.filter(name=self.name).exists():
            raise ValidationError('You have another app with the same name.')

    @classmethod
    def provision_subdomain(cls, subdomain):
        subdomain = clean_subdomain(subdomain)

        # prevent duplicate subdomains
        while cls.objects.filter(subdomain__iexact=subdomain).exists():
            subdomain += str(random.randint(1,9))

        # the above process may have caused string to grow, so trim if too long
        subdomain = subdomain[-min(len(subdomain), 40):] # take the last min(40, len subdomain) chars.

        return subdomain


    def get_state(self):
        return simplejson.loads(self._state_json)

    def set_state(self, val):
        self._state_json = simplejson.dumps(val)

    def set_test_state(self):
        with open(os.path.join(DEFAULT_STATE_DIR, "test_state.json")) as f:
            s = simplejson.load(f)
            self.state = s

    state = property(get_state, set_state)

    @property
    def api_key(self):
        return ApiKeyCounts.get_api_key_from_user(self.owner)

    @property
    def state_json(self):
        return self._state_json

    @property
    def uie_state(self):
        return simplejson.loads(self._uie_state_json)

    @property
    def uie_state_json(self):
        return self._uie_state_json

    @property
    def mobile_uie_state(self):
        return simplejson.loads(self._mobile_uie_state_json)

    @property
    def mobile_uie_state_json(self):
        return self._mobile_uie_state_json

    @property
    def entities(self):
        return self.state['entities']

    @property
    def pages(self):
        return self.state['pages']

    @property
    def mobile_pages(self):
        return self.state['pages']

    @property
    def urls(self):
        return self.state['urls']

    def isCurrentVersion(self, new_state):
        """Returns True if new_state is the same version as self.state's."""
        current_version_id = self.state.get('version_id', 0)
        new_version_id = new_state.get('version_id', 0)
        return (new_version_id == current_version_id)

    def get_absolute_url(self):
        return reverse('views.app_page', args=[str(self.id)])

    def clean(self):
        try:
            simplejson.loads(self._state_json)
        except simplejson.JSONDecodeError, e:
            raise ValidationError(e.msg)
        try:
            simplejson.loads(self._uie_state_json)
        except simplejson.JSONDecodeError, e:
            raise ValidationError(e.msg)

    def write_to_tmpdir(self, for_user=False):
        from app_builder.analyzer import App as AnalyzedApp
        from app_builder.controller import create_codes
        from app_builder.coder import Coder, write_to_fs


        app = AnalyzedApp.create_from_dict(self.state)

        app.api_key = self.api_key
        codes = create_codes(app)
        coder = Coder.create_from_codes(codes)

        tmp_project_dir = write_to_fs(coder, css=self.css(), for_user=for_user)

        return tmp_project_dir

    def hostname(self):
        if not settings.PRODUCTION:
            return "%s.staging.appcubator.com" % self.subdomain
        else:
            return "%s.appcubator.com" % self.subdomain

    def url(self):
        return "http://%s/" % self.hostname()

    def zip_bytes(self):
        tmpdir = self.write_to_tmpdir(for_user=True)

        def zipify(tmpdir):
            filenames = os.listdir(tmpdir)
            p = subprocess.Popen(shlex.split("/usr/bin/zip -r zipfile.zip %s" % ' '.join(filenames)), stdout=subprocess.PIPE, stderr=subprocess.PIPE, cwd=tmpdir)
            out, err = p.communicate()
            logger.debug("%s\n%s" % (("out", "err"), (out, err)))
            retcode = p.wait()
            logger.debug("Command exited with return code %d" % retcode)
            return os.path.join(tmpdir, 'zipfile.zip')

        try:
            zpath = zipify(tmpdir)
            with open(zpath, 'r') as zfile:
                zbytes = zfile.read()
        finally:
            # because hard disk space doesn't grow on trees.
            shutil.rmtree(tmpdir)

        return zbytes

    def css(self, deploy=True, mobile=False):
        """Use uiestate, less, and django templates to generate a string of the CSS"""
        from django.template import Context, loader
        t = loader.get_template('app-editor-less-gen.html')

        uie_state = self.uie_state
        if mobile:
            uie_state = self.mobile_uie_state

        context = Context({'uie_state': uie_state,
                           'isMobile': mobile,
                           'deploy': deploy})
        css_string = t.render(context)
        return css_string

    def get_deploy_data(self):
        post_data = {
            "subdomain": self.hostname(),
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        return post_data

    def _write_tar_from_app_dir(self, appdir):
        """
        Given the directory of the app, tar it up and return the path to the tar.
        """
        contents = os.listdir(appdir)
        # tar it up
        t = tarfile.open(os.path.join(appdir, 'payload.tar'), 'w')
        for fname in contents:
            t.add(os.path.join(appdir, fname), arcname=fname)
        t.close()
        return os.path.join(appdir, 'payload.tar')

    def _transport_app(self, appdir, retry_on_404=True):
        # tar it up
        tar_path = self._write_tar_from_app_dir(appdir)
        f = open(tar_path, "r")
        try:
            # catapult the tar over to the deployment server
            files = {'file':f}
            post_data = self.get_deploy_data()
            if self.deployment_id is None:
                r = requests.post("http://%s/deployment/" % settings.DEPLOYMENT_HOSTNAME, data=post_data, files=files, headers={'X-Requested-With': 'XMLHttpRequest'})
            else:
                r = requests.post("http://%s/deployment/%d/" % (settings.DEPLOYMENT_HOSTNAME, self.deployment_id), data=post_data, files=files, headers={'X-Requested-With': 'XMLHttpRequest'})

        finally:
            f.close()
            os.remove(os.path.join(appdir, 'payload.tar'))

        if r.status_code == 200:
            result = {}
            response_content = r.json()
            logger.debug("Deployment response content: %r" % response_content)
            try:
                self.deployment_id = response_content['deployment_id']
                self.save(state_version=False)
            except KeyError:
                pass
            if 'errors' in response_content:
                result['errors'] = response_content['errors']
            result['site_url'] = self.url()

            try:
                syncdb_data = [ u for u in response_content['script_results'] if 'syncdb.py' in u['script'] ][0]
                if u'value to use for existing rows' in syncdb_data['stderr']:
                    assert False, "Migration needs help!!!"
            except IndexError:
                pass # this is the fast_deploy case

            return result

        elif r.status_code == 400:
            try: # make sure we know this is the "subdomain is taken error"
                for e_str in r.json()['errors']['subdomain']:
                    if 'taken' not in e_str:
                        raise Exception(r.text)
            except KeyError: # otherwise, let it be known that this error is unknown.
                raise Exception(r.text)


            def increment(s):
                last_char = s[-1]
                if last_char in "123456780":
                    last_char = str(int(last_char) + 1)
                    s = s[:-1] + last_char
                else:
                    s = s + '2'
                return s

            old_subdomain = self.subdomain
            self.subdomain = increment(old_subdomain)
            logger.info("Subdomain %r was taken, so we changed to %r and we're trying again." % (old_subdomain, self.subdomain))
            self.save()
            return self.deploy(retry_on_404=retry_on_404)

        elif r.status_code == 404:
            assert retry_on_404
            logger.warn("The deployment was not found, so I'm setting deployment id to None")
            self.deployment_id = None
            self.save(state_version=False)
            return self._transport_app(appdir, retry_on_404=False)

        else:
            raise Exception("Deployment server error: %r" % r.text)

    def deploy(self, retry_on_404=True):
        tmpdir = self.write_to_tmpdir()
        try:
            logger.info("Deployed to %s" % tmpdir)
            r = self._transport_app(tmpdir, retry_on_404=retry_on_404)
        finally:
            # because hard disk space doesn't grow on trees.
            shutil.rmtree(tmpdir)
        return r

    def delete(self, *args, **kwargs):
        if self.deployment_id is not None:
            try:
                r = requests.delete("http://%s/deployment/%d/" % (settings.DEPLOYMENT_HOSTNAME, self.deployment_id), headers={'X-Requested-With': 'XMLHttpRequest'})

            except Exception:
                logger.error("Could not reach appcubator server.")
            else:
                if r.status_code != 200:
                    logger.error("Tried to delete %d, Deployment server returned bad response: %d %r" % (self.deployment_id, r.status_code, r.text))
        super(App, self).delete(*args, **kwargs)


class UITheme(models.Model):
    name = models.CharField(max_length=255, blank=True)
    designer = models.ForeignKey(User, blank=True, null=True)
    parent_theme = models.ForeignKey(
        'self', blank=True, null=True, default=None)
    image = models.URLField(
        blank=True, default="http://appcubator.com/static/img/theme4.png")

    web_or_mobile = models.CharField(max_length=1,
                                     choices=(('W', 'Web'), ('M', 'Mobile')),
                                     default = 'W')

    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)

    # Audit field
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    def get_state(self):
        return simplejson.loads(self._uie_state_json)

    def set_state(self, val):
        self._uie_state_json = simplejson.dumps(val)

    uie_state = property(get_state, set_state)

    @classmethod
    def create_mobile_theme(cls, name, user):
        theme = cls(name=name, designer=user, web_or_mobile='M')
        theme._uie_state_json = get_default_mobile_uie_state()
        theme.save()
        return theme

    def to_dict(self):
        try:
            designer = User.objects.get(pk=self.designer_id).username,
        except User.DoesNotExist:
            designer = 'v1 Factory'

        return {'id': self.id,
                'name': self.name,
                'designer': designer,
                'image': self.image,
                'statics': simplejson.dumps(list(self.statics.values())),
                'uie_state': self.uie_state,
                'web_or_mobile': self.web_or_mobile}

    def clone(self, user=None):
        new_self = UITheme(name=self.name,
                           _uie_state_json=self._uie_state_json,
                           parent_theme=self,
                           designer=user)
        return new_self

    @classmethod
    def get_mobile_themes(cls):
        themes = cls.objects.filter(web_or_mobile='M')
        return themes

    @classmethod
    def get_web_themes(cls):
        themes = cls.objects.filter(web_or_mobile='W')
        return themes

class StaticFile(models.Model):
    name = models.CharField(max_length=255)
    url = models.TextField()
    type = models.CharField(max_length=100)
    app = models.ForeignKey(App, blank=True, null=True, related_name="statics")
    theme = models.ForeignKey(
        UITheme, blank=True, null=True, related_name="statics")


# Used to keep track of any of our APIs usage.
# Count is incremented on each successful use.
class ApiKeyCounts(models.Model):
    api_key = models.CharField(max_length=255)
    api_count = models.IntegerField(default=0)

    @staticmethod
    def get_api_key_from_user(user):
      user_name = user.username
      date_joined = user.date_joined
      hash_string = user_name + str(date_joined)
      return hashlib.sha224(hash_string).hexdigest()


# Keeps track of individual usages, so we can do time based
# control and analytics later on.
class ApiKeyUses(models.Model):
    api_key = models.ForeignKey(ApiKeyCounts, related_name="api_key_uses")
    api_use = models.DateField(auto_now_add=True)

    @staticmethod
    def get_api_key_from_user(user):
      user_name = user.username
      date_joined = user.date_joined
      hash_string = user_name + str(date_joined)
      return hashlib.sha224(hash_string).hexdigest()


def load_initial_themes():
    theme_json_filenames = os.listdir(
        os.path.join(DEFAULT_STATE_DIR, "themes"))

    for filename in theme_json_filenames:
        if not filename.endswith('json'):
            continue
        try:
            sys.stdout.write("Loading %s" % filename)
            s = simplejson.loads(get_default_data(
                os.path.join("themes", filename)))
            sys.stdout.write(".")
            assert 'lines' in s
            t = UITheme(name=filename.replace(".json", ""))
            sys.stdout.write(".")
            t.set_state(s)
            sys.stdout.write(".")
            try:
                t.image = t.uie_state['img_url']
            except KeyError:
                sys.stdout.write("No key img_url for %r" % filename)
            sys.stdout.write(".")
            t.full_clean()
            sys.stdout.write(".")
            t.save()
            sys.stdout.write(".")
            print ""
        except Exception:
            # don't crash if one theme fails
            print "\nError with %s" % filename
            traceback.print_exc()


class DomainRegistration(models.Model):
    MAX_FREE_DOMAINS = 3

    user = models.ForeignKey(
        User, related_name="domains", blank=True, null=True)
    domain = models.CharField(max_length=50)
    _domain_info_json = models.TextField()
    dns_configured = models.IntegerField(default=0)

    @property
    def domain_info(self):
        return simplejson.loads(self._domain_info_json)

    # Audit field
    created_on = models.DateTimeField(auto_now_add=True)
    updated_on = models.DateTimeField(auto_now=True)

    from domains import DomainAPI
    api = DomainAPI()

    @classmethod
    def check_availability(self, domain):
        return DomainRegistration.api.check_availability(domain)

    @classmethod
    def register_domain(cls, domain, test_only=False):
        d = cls()
        d.domain = d
        if test_only:
            d._domain_info_json = "lol"
        else:
            d._domain_info_json = simplejson.dumps(
                DomainRegistration.api.register_domain(domain, money_mode=True))
            d.save()
        return d

    def configure_dns(self, staging=True):
        DomainRegistration.api.configure_domain_records(
            self.domain, staging=staging)
        self.dns_configured = 1
        self.save(state_version=False)

class LogAnything(models.Model):
    app_id = models.IntegerField(null=True)
    user_id = models.IntegerField(null=True)
    name = models.TextField()
    data = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)

    @property
    def data_json(self):
        return simplejson.loads(self.data)

class InvitationKeys(models.Model):
    api_key    = models.CharField(max_length=255)
    inviter_id = models.IntegerField(blank=True)
    invitee    = models.CharField(max_length=255)
    date       = models.DateTimeField(auto_now_add=True)
    accepted   = models.BooleanField(default=False)

    @classmethod
    def make_invitation_key(cls, user):
        hash_string = "%s %s %s %f" %(user.first_name, user.last_name, user.email, random.random())
        return hashlib.sha224(hash_string).hexdigest()

    @classmethod
    def create_invitation(cls, user, invitee):
        api_key = cls.make_invitation_key(user)
        invitation = cls(inviter_id=user.pk, invitee=invitee, api_key=api_key)
        invitation.save()
        return invitation

class Customer(models.Model):
    user_id = models.IntegerField(blank=True, null=True)
    name = models.TextField()
    email = models.EmailField(max_length=75)
    company = models.TextField()
    consulting = models.BooleanField(default=False)
    extra_info = models.TextField()
    project_description = models.TextField()
    sign_up_date = models.DateTimeField(auto_now_add=True)
    sign_up_fee = models.IntegerField()
    sent_welcome_email = models.BooleanField(default=False)

    @classmethod
    def create_first_time(cls, name, email, company, extra_info, description, sign_up_fee, consulting):
        customer = cls(user_id=0, name=name, email=email, company=company, consulting=consulting,
                       extra_info=extra_info, project_description=description, sign_up_fee=sign_up_fee)
        customer.save()

class AppstateSnapshot(models.Model):
    owner = models.ForeignKey(User, related_name='appstate_snapshots')
    app = models.ForeignKey(App, blank=True, null=True, related_name="appstate_snapshots")

    name = models.CharField(max_length=100)
    snapshot_date = models.DateTimeField(auto_now_add=True)

    _state_json = models.TextField(blank=True, default=get_default_app_state)

    @property
    def state_json(self):
        return self._state_json

class AnalyticsStore(models.Model):
    owner = models.ForeignKey(User, related_name='analytics_stores')
    app = models.ForeignKey(App, blank=True, null=True, related_name="analytics_stores")

    analytics_json = models.TextField()

    @property
    def analytics_data(self):
        result = {}
        try:
            result = simplejson.loads(self.analytics_json)
        except JSONDecodeError:
            print "Could not decode %r" % self.analytics_json
        else:
            return result
