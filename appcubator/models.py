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

from django.conf import settings

import deploy

from appcubator import codegen


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

class Deployment(models.Model):
    """
    This table is used to keep a cache of information about orphan deployments.
        - 'Error' orphan deployments are in bad shape and need to get checked out.
        - If not error, then 'Free'.
        - 'Free' orphan deployments may be used for new app deployments.
    """
    d_id = models.CharField(max_length=100, blank=False)
    has_error = models.BooleanField(default=False)
    created_on = models.DateTimeField(auto_now_add=True)

class App(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name='apps')

    deployment_id = models.CharField(max_length=100, blank=True, null=True, default=None)
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

    def is_new_version(self):
        """ True iff the saving state is same as last saved state """
        last_snap = self.get_last_snapshot()
        if last_snap is None:
            return True
        new_version = simplejson.loads(last_snap._state_json) != self.state
        return new_version

    def save(self, increment_version_if_changed=True,
            update_deploy_server=True,
            log_state_if_changed=True, *args, **kwargs):
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
            code_data = codegen.compileApp(self.state, css=self.css())
            tmp_project_dir = codegen.write_to_tmpdir(code_data)
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

    def deploy_url(self):
        return "http://devmon.%s/__update_code__" % self.hostname()

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
            if not settings.DEBUG:
                shutil.rmtree(tmpdir)

        return zbytes

    def css(self, mobile=False):
        """Use uiestate, django templates, and less codegen server to generate a string of the CSS"""
        from django.template import Context, loader
        t = loader.get_template('app-editor-css-gen.html')

        uie_state = self.uie_state
        if mobile:
            uie_state = self.mobile_uie_state

        context = Context({'uie_state': uie_state,
                           'isMobile': mobile,
                           'deploy': deploy})
        less_string = t.render(context)

        css_string = codegen.less(less_string)
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
            "url": self.url(),
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        return post_data

    def get_deployment_if_not_exists(self):
        """ Returns true if this had to do anything. """
        if self.deployment_id is None:
            # TODO make sure deployments are always available
            orphan = Deployment.objects.filter(has_error=False)[0]
            self.deployment_id = orphan.d_id
            # HACK
            self.custom_domain = self.deployment_id + '.' + settings.DEPLOYMENT_DOMAIN

            self.save()
            orphan.delete()
            return True

        return False

    def deploy(self, retry_on_404=True):
        tmpdir = '' # fixes the case where it's not defined in the finally clause later on

        # activates iff self.deployment_id is none
        self.get_deployment_if_not_exists()
        tmpdir = self.write_to_tmpdir()

        try:
            logger.info("Written to %s for code updating" % tmpdir)

            print self.deploy_url()
            deploy.update_code(tmpdir, self.deployment_id, self.deploy_url())

        except deploy.NotDeployedError:
            if retry_on_404:
                logger.warn("App was not actually deployed, probably from a prior error. Trying again.")
                self.record_deploy_error(traceback.format_exc())
                self.deployment_id = None
                self.custom_domain = None
                return self.deploy(retry_on_404=False)
            else:
                raise

        except Exception:
            """ TODO XXX
            self.deployment_id = None
            self.custom_domain = None
            """
            self.record_deploy_error(traceback.format_exc())
            raise
        else:
            self.clear_error_record(src='deploy')
        finally:
            # because hard disk space doesn't grow on trees.
            if not settings.DEBUG and tmpdir != '':
                shutil.rmtree(tmpdir)
        return self.deployment_id

    def delete(self, *args, **kwargs):
        if self.deployment_id is not None:
            try:
                deploy.zero_out(self.deployment_id, self.url())
            except deploy.NotDeployedError:
                logger.error("Got a 404 from the url")
            except Exception:
                raise
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
