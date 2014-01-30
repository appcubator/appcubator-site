import requests
import logging
from django.conf import settings
import os
import tarfile
import subprocess
import random
logger = logging.getLogger(__name__)


from deis import DeisClient

def login_if_required(dc):
    if not dc._settings.get('controller'):
        dc.auth_login({'<controller>':settings.DEIS_CONTROLLER,
                       '--username':settings.DEIS_USERNAME,
                       '--password':settings.DEIS_PASSWORD})


class DeploymentError(Exception):
    """Should be raised whenever the deployment server does not return 200"""
    pass

class NotDeployedError(Exception):
    """Indicates that the deployment id is bogus"""
    def __init__(self, deployment_id):
        self.deployment_id = deployment_id

def update_deployment_info(deployment_id, hostname):
    """Update the deployment with the new hostname"""
    pass

# tar it up
def _write_tar_from_app_dir(appdir):
    """Given the directory of the app, tar it up and return the path to the tar."""
    contents = os.listdir(appdir)
    # tar it up
    t = tarfile.open(os.path.join(appdir, 'payload.tar'), 'w')
    for fname in contents:
        t.add(os.path.join(appdir, fname), arcname=fname)
    t.close()
    p = subprocess.call(['gzip', 'payload.tar'], cwd=appdir)
    return os.path.join(appdir, 'payload.tar.gz')

def provision():
    """
    Builds a development sandbox on a Deis server.
    Returns deployment_id
    """
    dc = DeisClient()
    login_if_required(dc)
    deployment_id = dc.apps_create_without_git({'--formation': settings.DEIS_FORMATION })
                  # TODO set initial config.
                  #'<var>=<value>': [ key+u'='+unicode(value) for key, value in config_values.iteritems() ],
    return deployment_id

def rebuild(appdir, deployment_id, config_values=None):
    """
    Creates a new Build and Release
    """
    dc = DeisClient()
    login_if_required(dc)
    result = dc.apps_push({'<codepath>': appdir,
                  '--buildpack_url': 'https://github.com/appcubator/heroku-buildpack-nodejs',
                  '--app': deployment_id})
    return result

def rerelease(deployment_id, config_values):
    """
    Updates current config with new ones.
    Key : None means unset Key
    """
    dc = DeisClient()
    login_if_required(dc)
    result = dc.config_set({'--app': deployment_id,
                            '<var>=<value>': [ key+u'='+unicode(value) for key, value in config_values.iteritems() ] })
    return result


def update_code(appdir, deploy_id, url):
    """
    1. path to directory where app is stored
    2. deployment id (or none if it's not yet deployed)
    3. dictionary of deploy data
            "hostname": app.hostname(),
            "url": 'http://' + app.hostname() + '/', (reachable url)
            "deploy_secret": "v1factory rocks!",
    """
    tar_path = _write_tar_from_app_dir(appdir)
    print 'posting file: '+str(os.path.getsize(tar_path))
    try:
        with open(tar_path, "rb") as f:
            r = requests.post(url+'/__update_code__', files={'code':f})
    finally:
        os.remove(tar_path)

    if r.status_code == 404:
        raise NotDeployedError(deploy_id)

    if r.status_code != 200:
        raise DeploymentError(str(r.status_code) + r.text)


def destroy(deploy_id):
    dc = DeisClient()
    login_if_required(dc)
    dc.apps_destroy({'--app': deploy_id, '--confirm': deploy_id})

## BEGIN RANDOM SCRIPTS

PATH_TO_FAKE_APP = os.path.join(os.path.dirname(__file__), 'lolapp')

def zero_out(deploy_id, url):
    """
    Given an appcubator devmon deployment, update its code to be just a marketing page.
    TODO implement removal of code on devmon app for security purposes
    """
    return update_code(PATH_TO_FAKE_APP, deploy_id, url)

def get_orphans(known_deployments):
    dc = DeisClient()
    login_if_required(dc)
    all_apps = dc.apps_list({})
    return list(set(all_apps) - set(known_deployments))

def get_functioning_orphan(known_deps):
    orphs = get_orphans(known_deps)
    candidate = orphs.pop()
    while len(orphs) > 0:
        pass



def zero_out_bulk(deps, orphans=None):
    """
    Returns the deployments for which errors were encountered.
    """
    error_apps = []
    for d_id in deps:
        logger.info("Attempting to delete app with id=%s"%d_id)
        domain = d_id + '.' + settings.DEPLOYMENT_DOMAIN
        url = 'http://' + domain + '/'
        try:
            zero_out(d_id, url)
        except DeploymentError, e:
            logger.warn('That one errored')
            error_apps.append((e, d_id))
        except NotDeployedError, e:
            logger.warn('That one 404d')
            error_apps.append((e, d_id))
        else:
            logger.info("Deleted app with id=%s"%d_id)
    return error_apps


def make_new_app():
    d_id = provision()
    domain = d_id + '.' + settings.DEPLOYMENT_DOMAIN
    rerelease(d_id, {'MONGO_ADDR': os.environ['TEMP_MONGO']})
    url = 'http://' + domain + '/'
    result = rebuild(PATH_TO_FAKE_APP, url, d_id)
    print "rc: " + str(result['rc'])
    print "Out: " + result['out']
    if result['err']:
        print "Err: " + result['err']
        raise DeploymentError(result)
    return (d_id, url)


import unittest
from appcubator import codegen
from appcubator.default_data import get_default_app_state
import shutil
import json
APPSTATE = json.loads(get_default_app_state())


## Testing requires an example app. We use the default state + codegen
## Note: CODEGEN SERVER MUST BE LIVE TO TEST.
class TestProvision(unittest.TestCase):

    def setUp(self):
        self.appdir = codegen.write_to_tmpdir(codegen.compileApp(APPSTATE))

    def test_provision(self):
        self.id = random.randint(100, 999)
        url = 'http://testing%d.appcubator.com/' % self.id
        d_id = provision()
        out = rebuild(self.appdir, url, d_id)
        print out
        #import time; time.sleep(2)
        #r = requests.get(url)
        #self.assertEqual(r.status_code, 200)

    def tearDown(self):
        shutil.rmtree(self.appdir)


class TestNewApp(unittest.TestCase):
    def test_new_app_task_doesnt_error(self):
        print make_new_app()

class TestZeroOutApp(unittest.TestCase):
    def setUp(self):
        print "Making new app for testing..."
        self.d_id, self.url = make_new_app()
        print "Generating code for the default app..."
        self.appdir = codegen.write_to_tmpdir(codegen.compileApp(APPSTATE))
        print "Updating app with generated code..."
        update_code(self.appdir, self.d_id, self.url)

    def test_app_gets_zeroed_out(self):
        zero_out(self.d_id, self.url)
        import time; time.sleep(2)
        r = requests.get(self.url)
        self.assertEqual(r.status_code, 200)
        self.assertEqual(r.text.find('BEGIN UIELEMENTS'), -1)

class TestGetOrphans(unittest.TestCase):
    def setUp(self):
        dc = DeisClient()
        login_if_required(dc)
        all_apps = dc.apps_list({})
        known_apps = all_apps[:1]

        self.dc = dc
        self.known_apps = known_apps
        self.all_apps = all_apps

    def test_get_orphans(self):
        orphans = get_orphans(self.known_apps)
        print orphans
        self.assertEqual(set(orphans), set(self.all_apps) - set(self.known_apps))

#def zero_out_orphans(orphans=None):

if __name__ == "__main__":
    unittest.main()
