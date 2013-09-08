from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError
from simplejson import JSONDecodeError

import os, os.path
import re
import requests
import simplejson
import traceback
import sys
from datetime import datetime, timedelta

import subprocess, shlex
import hashlib
import random
import shutil

from app_builder.analyzer import App as AnalyzedApp # avoid conflict w site App
from app_builder.controller import create_codes
from app_builder.coder import Coder, write_to_fs

import deploy


DEFAULT_STATE_DIR = os.path.join(os.path.dirname(
    __file__), os.path.normpath("default_state"))

import logging
logger = logging.getLogger('appcubator.models')


class PubKey(models.Model):
    user = models.ForeignKey(User, related_name="pubkeys")
    pubkey = models.TextField(max_length=600)
    name = models.CharField(max_length=40, default="unnamed")

    # audit fields
    created_on = models.DateTimeField(auto_now_add = True)
    updated_on = models.DateTimeField(auto_now = True)

    @classmethod
    def sync_pubkeys_of_user(cls, user):
        """
        Calls to deployment server to sync this user's pubkeys.
        Returns HttpResponse of deployment API
        """
        pubkeys = user.pubkeys.order_by('-created_on')
        pubkeys_json = simplejson.dumps([p.pubkey for p in pubkeys])
        gitrepo_names_json = simplejson.dumps([a.gitrepo_name for a in user.apps.exclude(deployment_id=None)])
        r = requests.post("http://%s/user/%s/pubkeys/" % (settings.DEPLOYMENT_HOSTNAME, user.extradata.git_user_id()),
            data={'public_keys': pubkeys_json,
                  'gitrepo_names': gitrepo_names_json},
            headers={'X-Requested-With': 'XMLHttpRequest'})
        return r



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

    def git_user_id(self): # TODO fix in staging and dev case. (unique on id, hostname)
        return "user%d" % self.user.id

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

def clean_subdomain(subdomain, replace_periods=False):
    toks = subdomain.split('.')
    if len(toks) > 1:
        if replace_periods:
            subdomain = '-'.join([clean_subdomain(t) for t in toks if t != ''])
        else:
            subdomain = '.'.join([clean_subdomain(t) for t in toks if t != ''])
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


from random_primary import RandomPrimaryIdModel
class TempDeployment(RandomPrimaryIdModel):
    # now the id is random
    deployment_id = models.BigIntegerField(blank=True, null=True, default=None)
    # cached deployment info
    subdomain = models.CharField(max_length=50, blank=True, unique=True)

    # edit this to get different app state by default
    _state_json = models.TextField(blank=True, default=get_default_app_state)
    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)
    _mobile_uie_state_json = models.TextField(blank=True, default=get_default_mobile_uie_state)

    created = models.DateField(auto_now_add=True)

    def get_state(self):
        return simplejson.loads(self._state_json)

    def set_state(self, val):
        self._state_json = simplejson.dumps(val)

    state = property(get_state, set_state)

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

    """
    @staticmethod
    def get_rand_subdomain():
        t = "temp-%s" % self.id
        return t

    @classmethod
    def get_rand_uniq_subdomain(cls):
        s = cls.get_rand_subdomain()
        while cls.objects.filter(subdomain=s).exists() or App.objects.filter(subdomain=s).exists():
            # will terminate if s changes randomly
            s = cls.get_rand_subdomain()
        return s
    """

    @classmethod
    def create(cls):
        i = cls()
        i.subdomain = str(random.randint(10000000,90000000))
        i.save()
        i.subdomain = "temp-%s" % i.id#cls.get_rand_uniq_subdomain()
        i.save()
        return i

    @classmethod
    def delete_old(cls):
        how_many_days = 3
        dt_n_days_ago = datetime.now()-timedelta(days=how_many_days)
        for d in cls.objects.filter(created__gte=dt_n_days_ago):
            d.delete()

    def delete_deployment(self):
        if self.deployment_id is not None:
            r = requests.delete("http://%s/deployment/%d/" % (settings.DEPLOYMENT_HOSTNAME, self.deployment_id), headers={'X-Requested-With': 'XMLHttpRequest'})
            return r

    def delete(self, *args, **kwargs):
        if self.deployment_id is not None:
            try:
                r = self.delete_deployment()
            except Exception:
                logger.error("Could not reach appcubator server.")
            else:
                if r.status_code != 200:
                    logger.error("Tried to delete %d, Deployment server returned bad response: %d %r" % (self.deployment_id, r.status_code, r.text))
        super(App, self).delete(*args, **kwargs)

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

    def get_deploy_data(self, git_user=None):
        post_data = {
            "hostname": self.hostname(),
            "gitrepo_name": self.subdomain,
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        if git_user is not None:
            post_data['user_id'] = git_user
        return post_data

    def write_to_tmpdir(self):
        app = AnalyzedApp.create_from_dict(self.state)

        app.api_key = "sljlfksjdflsjdlfkjsdlkfjlsdk"
        codes = create_codes(app)
        coder = Coder.create_from_codes(codes)

        tmp_project_dir = write_to_fs(coder, css=self.css())

        return tmp_project_dir

    def hostname(self):
        if not settings.PRODUCTION: # debug and staging
            return "%s.staging.appcubator.com" % self.subdomain
        else:
            return "%s.appcubator.com" % self.subdomain

    def url(self):
        return "http://%s/" % self.hostname()

    def git_url(self):
        return "git@%s:%s.git" % (settings.DEPLOYMENT_HOSTNAME, "thisdoesntexist")

    def deploy(self, retry_on_404=True):
        tmpdir = self.write_to_tmpdir()
        try:
            logger.info("Deployed to %s" % tmpdir)
            is_merge, deployment_id = deploy.transport_app(tmpdir, self.deployment_id, self.get_deploy_data(), retry_on_404=retry_on_404)
            assert not is_merge
            if self.deployment_id is not None:
                assert deployment_id == self.deployment_id
            else:
                self.deployment_id = deployment_id
                self.save()
        finally:
            # because hard disk space doesn't grow on trees.
            shutil.rmtree(tmpdir)
        return (is_merge, deployment_id)

    def get_deployment_status(self):
        """
        Returns 0, 1, or 2.
         0 = No task running
         1 = Running
         2 = Task done, plz collect result.
        """
        if self.deployment_id is None:
            return 0
        s = deploy.get_deployment_status(self.deployment_id)
        return s



class App(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name='apps')

    deployment_id = models.BigIntegerField(blank=True, null=True, default=None)
    # cached deployment info
    subdomain = models.CharField(max_length=50, blank=True, unique=True)
    custom_domain = models.CharField(max_length=50, blank=True, null=True, unique=True, default=None) # if this is None, then the person is not using custom domain.
    gitrepo_name = models.CharField(max_length=50, blank=True, unique=True)

    _state_json = models.TextField(blank=True, default=get_default_app_state)
    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)
    _mobile_uie_state_json = models.TextField(blank=True, default=get_default_mobile_uie_state)


    def __init__(self, *args, **kwargs):
        super(App, self).__init__(*args, **kwargs)
        self._original_subdomain = self.subdomain
        self._original_gitrepo_name = self.gitrepo_name
        self._original_custom_domain = self.custom_domain

    def update_deployment_info(self):
        # calls method outside of this class
        if self.deployment_id is not None:
            r = deploy.update_deployment_info(self.deployment_id, self.hostname(), self.gitrepo_name)
        return r

    def get_deployment_status(self):
        """
        Returns 0, 1, or 2.
         0 = No task running
         1 = Running
         2 = Task done, plz collect result.
        """
        if self.deployment_id is None:
            return 0
        s = deploy.get_deployment_status(self.deployment_id)
        return s

    def save(self, state_version=True, update_deploy_server=True, *args, **kwargs):
        """
        If the deployment info (subdomain and gitrepo name) were changed since init,
        this will POST to the deployment server to update it.
        There for it may raise a DeploymentError
        """
        # increment version id
        s = self.state
        if state_version:
            s['version_id'] = s.get('version_id', 0) + 1
        self.state = s

        # update the deployment info on the server if it changed.
        if update_deploy_server and self.deployment_id is not None:
            if self._original_subdomain != self.subdomain or self._original_gitrepo_name != self.gitrepo_name or self._original_custom_domain != self.custom_domain:

                # update call to deployment server
                try:
                    self.update_deployment_info()
                except deploy.NotDeployedError:
                    self.deployment_id = None
                    self.deploy()

        return super(App, self).save(*args, **kwargs)

    @classmethod
    def provision_subdomain(cls, subdomain):
        subdomain = clean_subdomain(subdomain)

        # prevent duplicate subdomains
        while cls.objects.filter(subdomain__iexact=subdomain).exists():
            subdomain += str(random.randint(1,9))

        # the above process may have caused string to grow, so trim if too long
        subdomain = subdomain[-min(len(subdomain), 40):] # take the last min(40, len subdomain) chars.

        return subdomain

    @classmethod
    def provision_gitrepo_name(cls, gitrepo_name):
        gitrepo_name = clean_subdomain(gitrepo_name, replace_periods=True)

        # prevent duplicate gitrepo_names
        while cls.objects.filter(gitrepo_name__iexact=gitrepo_name).exists():
            gitrepo_name += str(random.randint(1,9))

        # the above process may have caused string to grow, so trim if too long
        gitrepo_name = gitrepo_name[-min(len(gitrepo_name), 40):] # take the last min(40, len gitrepo_name) chars.

        return gitrepo_name


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
        if self.owner.apps.filter(name=self.name).exclude(id=self.id).exists():
            raise ValidationError('You have another app with the same name.')
        try:
            simplejson.loads(self._state_json)
        except simplejson.JSONDecodeError, e:
            raise ValidationError(e.msg)
        try:
            simplejson.loads(self._uie_state_json)
        except simplejson.JSONDecodeError, e:
            raise ValidationError(e.msg)
        # Initial gitrepo name value. gets called on new app.
        if self.gitrepo_name == '':
            self.gitrepo_name = "%s-%s" % (self.owner.username.split('@')[0], self.name)
        if self.gitrepo_name != clean_subdomain(self.gitrepo_name, replace_periods=True):
            self.gitrepo_name = App.provision_gitrepo_name(self.gitrepo_name)

    def write_to_tmpdir(self):
        app = AnalyzedApp.create_from_dict(self.state)

        app.api_key = self.api_key
        codes = create_codes(app)
        coder = Coder.create_from_codes(codes)

        tmp_project_dir = write_to_fs(coder, css=self.css())

        return tmp_project_dir

    def hostname(self):
        if self.custom_domain is not None:
            return self.custom_domain
        if not settings.PRODUCTION: # debug and staging
            return "%s.staging.appcubator.com" % self.subdomain
        else:
            return "%s.appcubator.com" % self.subdomain

    def url(self):
        return "http://%s/" % self.hostname()

    def git_url(self):
        return "git@%s:%s.git" % (settings.DEPLOYMENT_HOSTNAME, self.gitrepo_name)

    def zip_bytes(self):
        tmpdir = self.write_to_tmpdir()

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

    def get_deploy_data(self, git_user=None):
        post_data = {
            "hostname": self.hostname(),
            "gitrepo_name": self.gitrepo_name,
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        if git_user is not None:
            post_data['user_id'] = git_user
        return post_data

    def deploy(self, retry_on_404=True):
        tmpdir = self.write_to_tmpdir()
        try:
            logger.info("Deployed to %s" % tmpdir)
            is_merge, data = deploy.transport_app(tmpdir, self.deployment_id, self.get_deploy_data(), retry_on_404=retry_on_404, git_user=self.owner.extradata.git_user_id())
            if not is_merge:
                self.deployment_id = data
                self.save() # might be unnecessary if nothing has changed.
        finally:
            # because hard disk space doesn't grow on trees.
            shutil.rmtree(tmpdir)
        return (is_merge, data)

    def delete_deployment(self):
        if self.deployment_id is not None:
            r = requests.delete("http://%s/deployment/%d/" % (settings.DEPLOYMENT_HOSTNAME, self.deployment_id), headers={'X-Requested-With': 'XMLHttpRequest'})
            return r

    def delete(self, *args, **kwargs):
        if self.deployment_id is not None:
            try:
                r = self.delete_deployment()
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
            logger.debug("Could not decode %r" % self.analytics_json)
            return None
        else:
            return result
