import requests
import simplejson
import subprocess
import os
import os.path
import sys

def create_github_repo(name):
  post_data = {}
  post_data['name'] = name
  post_data['has_issues'] = False
  post_data['has_wiki'] = False
  post_data['has_downloads'] = False

  r = requests.post("https://api.github.com/user/repos", data=simplejson.dumps(post_data), auth=('appcubator', 'obscurepassword321'))
  if r.status_code == 201:
    repo_info = simplejson.loads(r.content)
    return repo_info
  else:
    raise Exception(r.content)

def add_me_as_collaborator(name):
  r = requests.put("https://api.github.com/repos/appcubator/%s/collaborators/ksikka" % name, auth=('appcubator', 'obscurepassword321'))
  if r.status_code != 204:
    raise Exception(r.content)

def push(name, cwd, changes=True):

  if changes:
    child_env = os.environ.copy()
    ret_code = subprocess.call(['git', 'add', '.'], env=child_env, cwd=cwd)
    ret_code = subprocess.call(['git', 'commit', '-a', '-m', '"changes"'], env=child_env, cwd=cwd)
    ret_code = subprocess.call(['git', 'push', '-u', 'origin', 'master'], env=child_env, cwd=cwd)

def create(name, cwd, add_ksikka=False):
  child_env = os.environ.copy()
  ret_code = subprocess.call(['git', 'init', '.'], env=child_env, cwd=cwd)
  assert ret_code == 0, "Failed to init repo"

  try:
    repo_info = create_github_repo(name)
  except Exception, e:
    print "COULD NOT CREATE GITHUB REPO: %s" % str(e)
    repo_info = {'ssh_url': 'git@github.com:appcubator/%s.git' % name}
    print ""
    print repo_info
    print ""

  if add_ksikka:
    add_me_as_collaborator(name)

  ret_code = subprocess.call(['git', 'remote', 'add', 'origin', repo_info['ssh_url']], env=child_env, cwd=cwd)
  print ret_code
  assert ret_code in [0, 128], "Failed to add remote"
