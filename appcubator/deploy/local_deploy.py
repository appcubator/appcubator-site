import requests
import logging
import os
import tarfile
import random
import subprocess, shlex
logger = logging.getLogger(__name__)


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

fake_database = {} # d_id -> (Popen, port)

def provision(appdir, deploy_data):
    """
    Spawn a development sandbox.
    Returns deployment_id
    """
    tar_path = _write_tar_from_app_dir(appdir)
    devmonport = random.randint(1025, 60000) # TODO more properly find an available port
    appport = random.randint(1025, 60000)
    DEVMON = os.path.join(os.path.dirname(__file__), 'devmon.js')
    p = subprocess.Popen([DEVMON, str(devmonport), str(appport), tar_path, 'node', 'app.js', str(appport)])
    deployment_id = p.pid
    fake_database[deployment_id] = (p, devmonport)
    logger.info('127.0.0.1:%d' % devmonport + '\t' + deploy_data['url'])
    return deployment_id

def destroy(deploy_id):
    if deploy_id in fake_database:
        p, port = fake_database[deploy_id]
        p.kill()
        p.wait()
    else:
        raise NotDeployedError()

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
    f = open(tar_path, "r")
    try:
        r = requests.post(deploy_data['url'] + '__custom_code__', files={'code': f})
    finally:
        f.close()
        os.remove(os.path.join(appdir, 'payload.tar'))

    if r.status_code == 200:
        return r.json()['deployment_id']

    elif r.status_code == 404:
        raise NotDeployedError()

    else:
        raise DeploymentError("Deployment server error: %r" % r.text)

import unittest
from appcubator import codegen
from appcubator.default_data import get_default_app_state
import shutil
import json
APPSTATE = json.loads(get_default_app_state())


## Testing requires an example app. We use the default state + codegen
## Note: CODEGEN SERVER MUST BE LIVE TO TEST.
class TestLocalDeploy(unittest.TestCase):

    def setUp(self):
        self.appdir = codegen.write_to_tmpdir(codegen.compileApp(APPSTATE))

    def test_provision(self):
        dd = { 'hostname': 'doesntmatter.com',
               'url': 'http://doesntmatter.com/' }
        d_id = provision(self.appdir, dd)
        print "hi, " + str(d_id)

    def tearDown(self):
        shutil.rmtree(self.appdir)

if __name__ == "__main__":
    unittest.main()
