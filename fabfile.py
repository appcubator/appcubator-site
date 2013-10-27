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
  code_dir = '/var/www/appcubator-site/appcubator'
  with cd(code_dir):
    with prefix('source ../venv/bin/activate'):
      run("./static/build/build.sh")

repo_path = {
        'site': '/var/www/appcubator-site',
        'codegen': '/var/www/appcubator-codegen',
        'deploy': '/var/www/appcubator-deploy',
        'sysadmin': '/var/www/appcubator-sysadmin'
}

def pull(repo):
  code_dir = repo_path[repo]
  with cd(code_dir):
    run("git pull")

def install_codegen():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    with prefix('source venv/bin/activate'):
      run('pip install ../appcubator-codegen --upgrade')

def install_analytics():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    with prefix('source venv/bin/activate'):
      run('pip install ../appcubator-codegen/analytics --upgrade')

def install_requirements():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    with prefix('source venv/bin/activate'):
      run('pip install -r requirements.txt --upgrade')

def sync_and_migrate():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    with prefix('source venv/bin/activate'):
      with prefix('export DJANGO_SETTINGS_MODULE=settings.%s' % env.__mode):
        run('./manage.py syncdb')
        run('./manage.py migrate')

def reload_servers():
  code_dir = '/var/www/appcubator-sysadmin'
  with cd(code_dir):
    run('touch */*.ini')

def reload_themes():
  code_dir = '/var/www/appcubator-site'
  with cd(code_dir):
    with prefix('source venv/bin/activate'):
      with prefix('export DJANGO_SETTINGS_MODULE=settings.%s' % env.__mode):
        with prefix('export PYTHONPATH=$PWD'):
          run('python scripts/006_refresh_themes.py')
