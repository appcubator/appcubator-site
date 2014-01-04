import os, os.path

from django.db import models
from django.core.urlresolvers import reverse
from django.core.exceptions import ValidationError
from simplejson import JSONDecodeError

from django.contrib.auth.models import User

import re
import simplejson
import traceback
from datetime import datetime, timedelta

import subprocess, shlex
import hashlib
import random
import shutil

from utils import RandomPrimaryIdModel
from appcubator.default_data import DEFAULT_STATE_DIR, get_default_app_state, get_default_uie_state, get_default_mobile_uie_state

import deploy
from appcubator import codegen

from django.conf import settings


def email_to_uniq_username(email):
  """
  Used for creating initial usernames for users

  Assumes entering email is valid
  Crosses fingers that result is valid username :]
  """
  def uniqify(s):
    append = True
    while User.objects.filter(username__iexact=s).exists():
      if append:
        s += u"1"
        append = False
      else:
        last_char = s[-1]
        last_char = unicode(int(last_char)+1)
        s = s[:-1] + last_char
        if last_char == u"9":
          append = True
    return s

  try_username = email.split("@")[0]
  username = uniqify(try_username)
  return username

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
            except cls.DoesNotExist:
                cls(user=u, noob=0).save()

from django.db.models.signals import post_save

# AUTOMATICALLY CREATE EXTRADATA ON USER CREATION
def create_user_profile(sender, instance, created, **kwargs):
    """
    Create user profile for new users at save user time, if it doesn't already exist
    """
    try:
        instance.extradata
    except ExtraUserData.DoesNotExist:
        ExtraUserData(user=instance).save()

post_save.connect(create_user_profile, sender=User)

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
        # if name starts with number, replace it with an a
        subdomain = re.sub(r'^[0-9]', 'a', subdomain)

    # fix if too short
    if len(subdomain) == 0:
        subdomain = "unnamed"

    return subdomain


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
        s = i.state
        s['name'] = "Appcubator Demo"
        i.state = s
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
            pass # TODO implement

    def delete(self, *args, **kwargs):
        if self.deployment_id is not None:
            try:
                r = self.delete_deployment()
            except Exception:
                logger.error("Could not reach appcubator server.")
            else:
                if r.status_code != 200:
                    logger.error("Tried to delete %d, Deployment server returned bad response: %d %r" % (self.deployment_id, r.status_code, r.text))
        super(TempDeployment, self).delete(*args, **kwargs)

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
            "hostname": self.hostname(),
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        return post_data

    def write_to_tmpdir(self):
        """ old code:
        app = AnalyzedApp.create_from_dict(self.state)

        app.api_key = "sljlfksjdflsjdlfkjsdlkfjlsdk"
        codes = create_codes(app)
        coder = Coder.create_from_codes(codes)

        tmp_project_dir = write_to_fs(coder, css=self.css())

        return tmp_project_dir
        """
        code_data = codegen.compileApp(self.state)
        # TODO write the stuff from code_data to disk
        raise Exception("TODO implement me")

    def hostname(self):
        return "%s.%s" % (self.subdomain, settings.DEPLOYMENT_DOMAIN)

    def url(self):
        return "http://%s/" % self.hostname()

    def deploy(self, retry_on_404=True):
        tmpdir = self.write_to_tmpdir()
        try:
            logger.info("Deployed to %s" % tmpdir)
            is_merge, deployment_id = deploy.transport_app(tmpdir, self.deployment_id, self.get_deploy_data(), retry_on_404=retry_on_404)
            assert not is_merge
            if self.deployment_id is not None:
                logger.warn("Old deployment was not found, created a new deployment.")
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

    @staticmethod
    def find_or_create_temp_deployment(request):
        # create deployment in session
        if 'temp_deploy_id' in request.session:
            t_id = request.session['temp_deploy_id']
            try:
                t = TempDeployment.objects.get(id=t_id)
                return t # "found" branch exits here
            except TempDeployment.DoesNotExist:
                pass
        # if not found, create, deploy, return
        t = TempDeployment.create()
        request.session['temp_deploy_id'] = t.id
        return t


class App(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name='apps')

    deployment_id = models.BigIntegerField(blank=True, null=True, default=None)
    # cached deployment info
    subdomain = models.CharField(max_length=50, blank=True, unique=True)
    custom_domain = models.CharField(max_length=50, blank=True, null=True, unique=True, default=None) # if this is None, then the person is not using custom domain.

    # set on save and deploy calls.
    error_type = models.IntegerField(default=0)
    error_message = models.TextField(max_length=255, blank=True)

    created_on = models.DateTimeField(auto_now_add=True)

    collaborators = models.ManyToManyField(User, through='Collaboration')

    def get_error_type_name(self):
        err_type = self.error_type
        if err_type == 0:
            return "No Error"
        elif err_type == 1:
            return "compile"
        elif err_type == 2:
            return "compile2"
        elif err_type == 3:
            return "deploy"
        else:
            return "Unknown"

    def record_compile_error(self, message):
        self.error_type = 1
        self.error_message = message
        self.save()

    def record_compile2_error(self, message):
        self.error_type = 2
        self.error_message = message
        self.save()

    def record_deploy_error(self, message):
        self.error_type = 3
        self.error_message = message
        self.save()

    def clear_error_record(self, src=''):
        code_map = { 1: 'compile', 2: 'deploy' }
        # if src = 'compile', don't clear 'deploy' error, and vice versa
        if self.error_type != 0 and code_map.get(self.error_type, None) == src:
            self.error_type = 0
            self.error_message = ''
            self.save()

    _state_json = models.TextField(blank=True, default=get_default_app_state)
    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)
    _mobile_uie_state_json = models.TextField(blank=True, default=get_default_mobile_uie_state)


    def __init__(self, *args, **kwargs):
        super(App, self).__init__(*args, **kwargs)
        self._original_subdomain = self.subdomain
        self._original_custom_domain = self.custom_domain

    def update_deployment_info(self):
        # calls method outside of this class
        if self.deployment_id is not None:
            r = deploy.update_deployment_info(self.deployment_id, self.hostname())
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

    def is_new_version(self):
        """ True iff the saving state is same as last saved state """
        last_snap = self.get_last_snapshot()
        if last_snap is None:
            return True
        new_version = simplejson.loads(last_snap._state_json) != self.state
        return new_version

    def save(self, increment_version_if_changed=True, update_deploy_server=True, log_state_if_changed=True, *args, **kwargs):
        """
        If the deployment info (subdomain) were changed since init,
        this will POST to the deployment server to update it.
        There for it may raise a DeploymentError
        """

        if self.is_new_version():

            if increment_version_if_changed:
                s = self.state
                s['version_id'] = s.get('version_id', 0) + 1
                self.state = s

            if log_state_if_changed:
                appstate_snapshot = AppstateSnapshot(owner=self.owner,
                    app=self, name=self.name, snapshot_date=datetime.now(), _state_json=self._state_json)
                appstate_snapshot.save()

        # update the deployment info on the server if it changed.
        if update_deploy_server and self.deployment_id is not None:
            if self._original_subdomain != self.subdomain or self._original_custom_domain != self.custom_domain:

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
    def provision_app_name(cls, app_name, user_id):
        app_name = app_name[:100] # max char, this is the only cleaning we have to do.

        # prevent duplicate app_names
        while cls.objects.filter(owner_id = user_id, name__iexact=app_name).exists():
            toks = app_name.split(" ")
            last_tok = toks[-1]
            try:
                i = int(last_tok)
            except ValueError:
                toks.append(unicode(2))
            else:
                if i <= 1:
                    toks.append(unicode(2))
                else:
                    i += 1
                    toks[-1] = unicode(i)

            app_name = " ".join(toks)

            # the above process may have caused string to grow, so trim if too long
            app_name = app_name[-min(len(app_name), 40):] # take the last min(40, len app_name) chars.

        return app_name

    def clone(self):
        new_app_name = App.provision_app_name(self.name, self.owner_id)
        new_subdomain = App.provision_subdomain(self.name)
        cloned_app = App(name=new_app_name,
                         subdomain=new_subdomain,
                         owner=self.owner)
        cloned_app.save()
        from plugins.models import copy_provider_data
        copy_provider_data(self, cloned_app)
        return cloned_app

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


    def get_last_snapshot(self):
        try:
            snapshot = AppstateSnapshot.objects.filter(app=self).latest('snapshot_date')
        except AppstateSnapshot.DoesNotExist:
            return None
        return snapshot

    @property
    def last_update(self):
        snapshot = self.get_last_snapshot()
        if snapshot:
            return snapshot.snapshot_date
        else:
            return None

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

    def write_to_tmpdir(self):
        self.parse_and_link_app_state()

        # app.api_key = self.api_key
        try:
            # TODO FIXME
            #codes = create_codes(app,
            #            uid=self.uid(),
            #            email=self.owner.email,
            #            provider_data=self.get_plugin_data())
            #coder = Coder.create_from_codes(codes)

            #tmp_project_dir = write_to_fs(coder, css=self.css())
            code_data = codegen.compileApp(self.state)
            tmp_project_dir = codegen.write_to_tmpdir(code_data)
            # TODO write the stuff from code_data to disk
        except Exception:
            self.record_compile2_error(traceback.format_exc())
            raise

        return tmp_project_dir

    def parse_and_link_app_state(self):
        try:
            app = codegen.expandAll(self.state)
        except codegen.UserInputError, e:
            self.record_compile_error(traceback.format_exc())
        else:
            self.clear_error_record(src='compile')
            return app

    def hostname(self):
        if self.custom_domain is not None:
            return self.custom_domain
        return "%s.%s" % (self.subdomain, settings.DEPLOYMENT_DOMAIN)

    def url(self):
        return "http://%s/" % self.hostname()

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

    def uid(self):
        # avoid generating secret keys if not in production
        if settings.DEBUG:
            return "we got a cool kid over here."

        return str(self.id)

    def get_plugin_data(self):
        provider_data_rows = self.providerdata_set.values('provider_key__provider__internal_name',
                                                          'provider_key__internal_name',
                                                          'value')
        provider_map = {}
        for d in provider_data_rows:
            provider = d['provider_key__provider__internal_name']

            if provider not in provider_map:
                provider_map[provider] = {}

            this_provider_dict = provider_map[provider]
            provider_key = d['provider_key__internal_name']
            assert provider_key not in this_provider_dict, "this would violate the single value to key principle"
            this_provider_dict[provider_key] = d['value']

        print "PLUGIN DATA: ", provider_map
        return provider_map

    def get_deploy_data(self):
        post_data = {
            "hostname": self.hostname(),
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        return post_data

    def deploy(self, retry_on_404=True):
        tmpdir = self.write_to_tmpdir()
        try:
            logger.info("Deployed to %s" % tmpdir)
            #is_merge, data = deploy.transport_app(tmpdir, self.deployment_id, self.get_deploy_data(), retry_on_404=retry_on_404)
            is_merge, data = False, None
            if not is_merge:
                self.deployment_id = data
                self.save() # might be unnecessary if nothing has changed.
        except Exception:
            self.record_deploy_error(traceback.format_exc())
            raise
        else:
            self.clear_error_record(src='deploy')
        finally:
            # because hard disk space doesn't grow on trees.
            # TODO uncomment below once deployment is working
            pass
            #shutil.rmtree(tmpdir)
        return (is_merge, data)

    def delete_deployment(self):
        if self.deployment_id is not None:
            pass # TODO implement

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

    def is_editable_by_user(self, user):
        """ Returns True iff the given user is allowed to edit this app. """
        if not user.is_authenticated():
            return False
        if self.owner.id == user.id:
            return True
        if user.is_superuser:
            return True
        if self.collaborations.filter(user=user).exists():
            return True

        return False

    def add_user_as_collaborator(self, user):
        """
        Returns False if the user was already a collaborator or the owner,
        True if user was just added as collaborator.
        """
        if self.owner.id == user.id:
            return False
        if Collaboration.objects.filter(user=user, app=self).exists():
            return False
        c = Collaboration(user=user, app=self)
        c.save()
        return True



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
        self.save()

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

    @classmethod
    def add_collaborations(cls, user, invite_key):
        """
        Designed to fail silently if no collab invites exist for the invite key.
        Return True if the user was added as a collaborator to some app.
        """
        try:
            c = CollaborationInvite.objects.get(invite_key=invite_key)
        except CollaborationInvite.DoesNotExist:
            print invite_key
            print "meow"
            return False

        invited_email = c.email
        valid_emails = (user.email, invited_email)

        collab_invites = CollaborationInvite.objects.filter(email__in=valid_emails)
        for collab_invite in collab_invites:
            collab_invite.app.add_user_as_collaborator(user)
            collab_invite.delete()
        return True


class CollaborationInvite(models.Model):
    """
    A piece of data which means that when the user with this email signs up,
    he or she should be added as a collaborator to some app.
    """
    invite_key = models.CharField(max_length=255, unique=True)
    email = models.CharField(max_length=255) # of the invited person
    inviter = models.ForeignKey(User)
    app = models.ForeignKey(App)
    created_on = models.DateTimeField(auto_now_add = True)


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


class Collaboration(models.Model):
    user = models.ForeignKey(User, related_name="collaborations")
    app = models.ForeignKey(App, related_name="collaborations")

    created_on = models.DateTimeField(auto_now_add = True)
