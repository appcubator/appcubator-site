from __future__ import with_statement
from fabric.api import local, settings, abort, run, cd, env, hosts, prefix
from fabric.contrib.console import confirm


def staging():
  env.hosts = ['v1factory@staging.appcubator.com']
  env.__mode = 'staging'

def prod():
  env.hosts = ['v1factory@appcubator.com']
  env.__mode = 'prod'

def build_static():
  code_dir = '/var/www/appcubator/appcubator'
  with cd(code_dir):
    run("./static/build/build.sh")

def pull():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    run("git pull")

def sync_and_migrate():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    with prefix('source venv'):
      with prefix('export DJANGO_SETTINGS_MODULE=settings.%s' % env.__mode):
        run('./manage.py syncdb')
        run('./manage.py migrate')

def reload_servers():
  code_dir = '/var/www/appcubator-sysadmin'
  with cd(code_dir):
    run('touch */*.ini')
