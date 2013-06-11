from celery import task
import subprocess
import os
import os.path
import shlex

@task()
def push(name, cwd, changes=True):
  if changes:
    child_env = os.environ.copy()
    ret_code = subprocess.call(['git', 'add', '.'], env=child_env, cwd=cwd)
    print "Git add: ", ret_code
    ret_code = subprocess.call(['git', 'commit', '-a', '-m', '"changes"'], env=child_env, cwd=cwd)
    print "Git commit: ", ret_code
    ret_code = subprocess.call(['git', 'push', '-u', 'origin', 'master'], env=child_env, cwd=cwd)
    print "Git push: ", ret_code

@task()
def syncdb(app, child_env):
  commands = []
  commands.append('python manage.py syncdb --noinput')
  commands.append('python manage.py migrate social_auth')

  # if migrations is not yet a directory, then setup south
  if not os.path.isdir(os.path.join(app.app_dir, 'webapp', 'migrations')):
    print("Web app has not yet been migrated - converting to south.")
    commands.append('python manage.py convert_to_south webapp')

  # else, try to migrate the schema
  else:
    commands.append('python manage.py schemamigration webapp --auto')
    commands.append('python manage.py migrate webapp')

  for c in commands:
    print("Running `{}`".format(c))
    try:
      log_msg = subprocess.check_output(shlex.split(c), env=child_env, cwd=app.app_dir)
    except subprocess.CalledProcessError, e:
      print(repr(e.cmd) + " returned with exit code of " + str(e.returncode))
      print("Command output: " + e.output)
      # TODO send error to someone! don't let this fail silently

    print(log_msg)
