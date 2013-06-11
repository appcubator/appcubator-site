import os, sys, subprocess
import simplejson
import traceback
import os.path
import shlex
import subprocess
import django.conf
import random
import string
import time
import shutil
from django.db import models
import requests
import logging
logger = logging.getLogger("deployment_models")
import tasks

def copytree(src, dst, symlinks=False, ignore=None):
  """shutil.copytree wrapper which works even when the dest dir exists"""
  for item in os.listdir(src):
    s = os.path.join(src, item)
    d = os.path.join(dst, item)
    if os.path.isdir(s):
      if not os.path.isdir(d):
        os.makedirs(d)
      copytree(s, d, symlinks, ignore)
    else:
      shutil.copy2(s, d)

class Deployment(models.Model):
  subdomain = models.CharField(max_length=50, unique=True)
  u_name = models.CharField(max_length=100, unique=True)
  app_state_json = models.TextField(blank=True)
  css = models.TextField(blank=True)
  app_dir = models.TextField()
  config_file_path = models.TextField()

  #Audit field
  created_on = models.DateTimeField(auto_now_add = True)
  updated_on = models.DateTimeField(auto_now = True)

  @classmethod
  def create(cls, subdomain, u_name=None, app_state=None):
    self = cls(subdomain=subdomain, u_name=u_name)
    self.app_dir = "/var/www/apps/" + u_name
    self.config_file_path = "/var/www/configs/" + u_name
    if app_state is not None:
      self.app_state_json = simplejson.dumps(app_state)
    return self

  def apache_config(self):
    try:
      domain = simplejson.loads(self.app_state_json)['info']['domain']
    except Exception, e:
      print e
      print "could not extract domain from app state"
      domain = None

    return fillout_config(self.u_name, self.subdomain, self.app_dir, domain=domain)

  def initialize(self):
    """Setup apache config and write a blank app to the app path"""

    # make app directory
    try:
      os.makedirs(self.app_dir)
    except OSError: # directory is already there! no problemo
      pass

    a_conf = open(self.config_file_path, "w")
    a_conf.write(self.apache_config())
    a_conf.close()


  def is_initialized(self):
    """checks if this app has already been initialized"""
    return os.path.isdir(self.app_dir) and os.path.isfile(self.config_file_path)

  def write_to_tmpdir(self, d_user):
    from app_builder.analyzer import App as AnalyzedApp
    from app_builder.controller import create_codes
    from app_builder.coder import Coder, write_to_fs


    app = AnalyzedApp.create_from_dict(simplejson.loads(self.app_state_json))
    codes = create_codes(app)
    coder = Coder.create_from_codes(codes)

    tmp_project_dir = write_to_fs(coder, css=self.css)

    return tmp_project_dir

  def update_app_state(self, app_dict):
    self.app_state_json = simplejson.dumps(app_dict)
    return self

  def update_css(self, css):
    self.css = css
    return self

  def deploy(self, d_user):
    logger.info("Writing config files and making sure hosting folder exists.")
    self.initialize()

    # GENERATE CODE
    try:
      tmp_project_dir = self.write_to_tmpdir(d_user)
    except Exception, e:
      trace = traceback.format_exc()
      logger.error(str(e))
      logger.error(trace)
      return { "errors": trace }

    logger.info("Project written to " + tmp_project_dir)

    if not django.conf.settings.PRODUCTION:
      logger.info("Not a production deployment - returning now.")
      return tmp_project_dir

    child_env = os.environ.copy()
    if "DJANGO_SETTINGS_MODULE" in child_env:
      del child_env["DJANGO_SETTINGS_MODULE"]
    # Hack to make syncdb work.
    child_env["PATH"] = "/var/www/appcubator/venv/bin:" + child_env["PATH"]

    # COPY THE CODE TO THE RIGHT DIRECTORY
    logger.info("Removing existing app code.")
    for f in os.listdir(self.app_dir):
      if f in ["db", ".git", "migrations"]:
        continue
      f_path = os.path.join(self.app_dir, f)
      if os.path.isfile(f_path):
        os.remove(f_path)
      else:
        if f != "webapp": # migrations folder is in this one
          shutil.rmtree(f_path)
    logger.info("Copying temp project dir to the real path -> " + self.app_dir)
    copytree(tmp_project_dir, self.app_dir)

    logger.info("Sync the db, perform migrations if needed")
    r = tasks.syncdb.delay(self, child_env)

    return {}

  def delete(self, delete_files=True, *args, **kwargs):
    try:
      # delete app files
      if delete_files:
        os.remove(self.config_file_path)
        shutil.rmtree(self.app_dir)

      # try to delete github repo
      repo_name = self.u_name
      assert repo_name.lower().strip() != 'appcubator'
      r = requests.delete("https://api.github.com/repos/v1factory/%s" % repo_name, auth=('appcubator', 'obscurepassword321'))

      # try to restart server
      ret_code = subprocess.call(["sudo", "/var/www/v1factory/reload_apache.sh"])
      assert(ret_code == 0)
    except Exception, e:
      print e
    finally:
      super(Deployment, self).delete(*args, **kwargs)








# This was ugly in the main code so I moved it down here.
APACHE_CONFIG_TMPL = """
<VirtualHost *:80>
	ServerName {subdomain}.appcubator.com
  {optional_alias_string}
	ServerAdmin founders@appcubator.com

	WSGIScriptAlias / {app_dir}/wsgi.py
	WSGIDaemonProcess {u_name} python-path={app_dir}:/var/www/libs/lib/python2.7/site-packages
	WSGIProcessGroup {u_name}

	<Directory {app_dir}>
	<Files wsgi.py>
	Order deny,allow
	Allow from all
	</Files>
	</Directory>

	Alias /static/ {app_dir}/webapp/static/
	<Directory {app_dir}/static/>
	Order deny,allow
	Allow from all
	</Directory>

	LogLevel info
	ErrorLog {app_dir}/error.log
	CustomLog {app_dir}/access.log combined
</VirtualHost>"""

def fillout_config(u_name, subdomain, app_dir, domain=None):
  optional_alias_string = ""
  if domain is not None:
    optional_alias_string = "ServerAlias %s" % domain

  return APACHE_CONFIG_TMPL.format(subdomain=subdomain,
                                   u_name=u_name,
                                   app_dir=app_dir,
                                   optional_alias_string=optional_alias_string)
