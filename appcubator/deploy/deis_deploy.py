import requests
import logging
from django.conf import settings
import os
import tarfile
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
    pass

def update_deployment_info(deployment_id, hostname):
    """Update the deployment with the new hostname"""
    pass

def get_deployment_status(deployment_id):
    """
    Returns 0, 1, or 2.
     0 = No task running
     1 = Running
     2 = Task done, plz collect result.
    #TODO async
    """
    return random.randint(0,1) * 2

# tar it up
def _write_tar_from_app_dir(appdir):
    """Given the directory of the app, tar it up and return the path to the tar."""
    contents = os.listdir(appdir)
    # tar it up
    t = tarfile.open(os.path.join(appdir, 'payload.tar'), 'w')
    for fname in contents:
        t.add(os.path.join(appdir, fname), arcname=fname)
    t.close()
    return os.path.join(appdir, 'payload.tar')

def provision(appdir, deploy_data):
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

def rebuild(appdir, deploy_data, deployment_id, config_values=None):
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


def update_code(appdir, deploy_id, deploy_data):
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
            r = requests.post(deploy_data['url']+'/__update_code__', files={'code':f})
    finally:
        os.remove(tar_path)

    if r.status_code != 200:
        raise Exception(str(r.status_code) + r.text)


def destroy(deploy_id):
    dc = DeisClient()
    login_if_required(dc)
    dc.apps_destroy({'--app': deploy_id, '--confirm': deploy_id})


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
        dd = { 'hostname': 'testing%d.appcubator.com' % self.id,
               'url': 'http://testing%d.appcubator.com/' % self.id }
        d_id = provision(self.appdir, dd)
        out = rebuild(self.appdir, dd, d_id)
        print out
        #import time; time.sleep(2)
        #r = requests.get(dd['url'])
        #self.assertEqual(r.status_code, 200)

    def tearDown(self):
        shutil.rmtree(self.appdir)

if __name__ == "__main__":
    unittest.main()

