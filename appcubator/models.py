from django.db import models
from django.core.urlresolvers import reverse
from django.contrib.auth.models import User
from django.conf import settings
from django.core.exceptions import ValidationError

import tarfile
import os, os.path
import re
import requests
import simplejson
import traceback
import sys

DEFAULT_STATE_DIR = os.path.join(os.path.dirname(
    __file__), os.path.normpath("default_state"))


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


class App(models.Model):
    name = models.CharField(max_length=100)
    owner = models.ForeignKey(User, related_name='apps')

    subdomain = models.CharField(max_length=50, blank=True)

    _state_json = models.TextField(blank=True, default=get_default_app_state)
    _uie_state_json = models.TextField(blank=True, default=get_default_uie_state)
    _mobile_uie_state_json = models.TextField(blank=True, default=get_default_mobile_uie_state)

    deployment_id = models.IntegerField(blank=True, null=True, default=None)

    def save(self, *args, **kwargs):
        if self.subdomain == "":
            self.subdomain = self.u_name()
        return super(App, self).save(*args, **kwargs)

    def clean(self):
        from django.core.exceptions import ValidationError
        if self.owner.apps.filter(name=self.name).exists():
            raise ValidationError('You have another app with the same name.')

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

    def summary_user_settings(self):
        """Human-readable summary of the user settings"""
        summary = ""
        summary += "Enabled auth modes:\t{};".format(", ".join(
            [a for a, v in self.state['users'].items() if v]))
        return summary

    def summary_entities(self):
        """Human-readable summary of the entities"""
        summary = ""
        summary += "Entities:\t\t{};".format(", ".join(
            [e['name'] for e in self.state['entities']]))
        return summary

    def summary_pages(self):
        """Human-readable summary of the pages"""
        summary = ""
        summary += "Pages:\t\t\t{};".format(", ".join(['("{}", {})'.format(
            u['page_name'], u['urlparts']) for u in self.state['urls']]))
        return summary

    def write_to_tmpdir(self):
        from app_builder.analyzer import App as AnalyzedApp
        from app_builder.controller import create_codes
        from app_builder.coder import Coder, write_to_fs


        app = AnalyzedApp.create_from_dict(self.state)
        codes = create_codes(app)
        coder = Coder.create_from_codes(codes)

        tmp_project_dir = write_to_fs(coder, css=self.css())

        return tmp_project_dir

    def u_name(self):
        """Used to be the way we generate subdomains, but now it's just a function
        that almost always returns a unique name for this app"""
        u_name = self.owner.username.lower() + "-" + self.name.replace(
            " ", "-").lower()
        if not settings.PRODUCTION or settings.STAGING:
            u_name = u_name + '.staging'
            if not settings.STAGING:
                u_name = "dev-" + u_name
        return u_name

    def hostname(self):
        return "%s.appcubator.com" % self.subdomain

    def url(self):
        return "http://%s.appcubator.com/" % self.subdomain

    def github_url(self):
        return "https://github.com/appcubator/" + self.u_name()

    def css(self, deploy=True):
        """Use uiestate, less, and django templates to generate a string of the CSS"""
        from django.template import Context, loader
        t = loader.get_template('app-editor-less-gen.html')
        context = Context({"app": self, "deploy": deploy})
        css_string = t.render(context)
        return css_string

    def get_deploy_data(self):
        post_data = {
            "u_name": self.u_name(),
            "subdomain": self.hostname(),
            "app_json": self.state_json,
            "deploy_secret": "v1factory rocks!"
        }
        return post_data

    def deploy(self, retry_on_404=True):
        tmpdir = self.write_to_tmpdir()
        contents = os.listdir(tmpdir)
        # tar it up
        t = tarfile.open(os.path.join(tmpdir, 'payload.tar'), 'w')
        try:
            for fname in contents:
                t.add(os.path.join(tmpdir, fname), arcname=fname)
            t.close()
            f = open(os.path.join(tmpdir, 'payload.tar'), "r")

            # send the whole shibam to deployment server
            files = {'file':f}
            post_data = self.get_deploy_data()
            if self.deployment_id is None:
                r = requests.post("http://staging.appcubator.com/deployment/", data=post_data, files=files)
            else:
                r = requests.post("http://staging.appcubator.com/deployment/%s/" % self.deployment_id, data=post_data, files=files)

        finally:
            f.close()
            os.remove(os.path.join(tmpdir, 'payload.tar'))

        if r.status_code == 200:
            result = {}
            response_content = r.json()
            try:
                self.deployment_id = response_content['deployment_id']
                self.save()
            except KeyError:
                pass
            if 'errors' in response_content:
                result['errors'] = response_content['errors']
            result['site_url'] = "http://%s.appcubator.com" % self.subdomain
            result['github_url'] = self.github_url()
            return result

        elif r.status_code == 404:
            assert retry_on_404
            self.deployment_id = None
            self.save()
            return self.deploy(retry_on_404=False)

        else:
            raise Exception(r.content)
    """
    def deploy(self, d_user):
        # this will post the data to appcubator.com
        post_data = {
            "u_name": self.u_name(),
            "subdomain": self.subdomain,
            "app_json": self.state_json,
            "css": self.css(),
            "d_user": simplejson.dumps(d_user),
            "deploy_secret": "v1factory rocks!"
        }
        # deploy to the staging server unless this is the production server.
        if settings.PRODUCTION and not settings.STAGING:
            r = requests.post("http://appcubator.com/deployment/push/", data=post_data, headers={
                              "X-Requested-With": "XMLHttpRequest"})
        else:
            r = requests.post("http://staging.appcubator.com/deployment/push/", data=post_data, headers={
                              "X-Requested-With": "XMLHttpRequest"})

        if r.status_code == 200:
            response_content = r.json()
            result = {}
            result['site_url'] = "http://%s.appcubator.com" % self.subdomain
            result['github_url'] = self.github_url()
            if 'errors' in response_content:
                result['errors'] = response_content['errors']
            return result
        else:
            raise Exception(r.content)
            """

    def deploy_test(self):
        return "do the funky chicken"
        analyzed_app = AnalyzedApp.create_from_dict(self.state, self.name)
        django_writer = DjangoWriter(analyzed_app)

        # Also want to print:
        #     user settings
        #     entities
        #     urls/pages
        print "\n".join([self.summary_user_settings(),
                         self.summary_entities(),
                         self.summary_pages()])

        def print_test(heading, test_output_fun):
            print "\n\n\n", 17 * "#", 7 * " ", heading, 7 * " ", 17 * "#"
            try:
                test_output = test_output_fun()
            except Exception:
                traceback.print_exc(file=sys.stdout)
            else:
                print "\n".join(["> " + line for line in test_output.split('\n')])
            print 17 * "#", 7 * " ", "END", 7 * " ", 17 * "#"

        print_test("urls.py", django_writer.urls_py_as_string)
        print_test("models.py", django_writer.models_py_as_string)
        print_test("model_forms.py", django_writer.model_forms_py_as_string)
        print_test("views.py", django_writer.views_py_as_string)
        print_test("form_receivers.py",
                   django_writer.form_receivers_py_as_string)
        print_test("templates", lambda: "\n\nNEXT:\n".join([t[
                   1] for t in django_writer.templates_as_strings()]))

    def delete(self, *args, **kwargs):
        try:
            post_data = {"u_name": self.u_name()}
            if settings.STAGING:
                r = requests.post(
                    "http://staging.appcubator.com/deployment/delete/", post_data)
            elif settings.PRODUCTION:
                r = requests.post(
                    "http://appcubator.com/deployment/delete/", post_data)
            else:
                raise Exception("")

        except Exception:
            print "Warning: could not reach appcubator server."
        else:
            if r.status_code != 200:
                print "Error: appcubator could not delete the deployment. Plz do it manually."
        finally:
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

# Keeps track of individual usages, so we can do time based
# control and analytics later on.


class ApiKeyUses(models.Model):
    api_key = models.ForeignKey(ApiKeyCounts, related_name="api_key_counts")
    api_use = models.DateField(auto_now_add=True)


def load_initial_themes():
    theme_json_filenames = os.listdir(
        os.path.join(DEFAULT_STATE_DIR, "themes"))

    for filename in theme_json_filenames:
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
    def register_domain(self, domain, test_only=False):
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
            domain, staging=staging)
        self.dns_configured = 1
        self.save()


class TutorialLog(models.Model):
    user = models.ForeignKey(User, related_name="logs")
    opened_on = models.DateTimeField(auto_now_add=True)
    title = models.CharField(max_length=300, blank=True)
    directory = models.CharField(max_length=50, blank=True)

    @classmethod
    def create_log(cls, user, title, directory):
        log = cls(user=user, title=title, directory=directory)
        log.save()

    @classmethod
    def create_feedbacklog(cls, user, message):
        log = cls(user=user, title=message, directory="feedback")
        log.save()

    @classmethod
    def is_donewithfeedback(cls, user):
        log = cls.objects.filter(user=user, directory="feedback")
        if len(log) is 0:
            return False
        else:
            return True

    @classmethod
    def get_percentage(cls, user):
        log = cls.objects.filter(user=user).exclude(
            directory='').values("directory").annotate(n=models.Count("pk"))
        percentage = (len(log) * 100) / 15
        return percentage


class RouteLog(models.Model):
    user_id = models.IntegerField()
    opened_on = models.DateTimeField(auto_now_add=True)
    app_id = models.IntegerField()
    page_name = models.TextField()


class Customer(models.Model):
    user_id = models.IntegerField(blank=True)
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
