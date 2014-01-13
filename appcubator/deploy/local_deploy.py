import requests
import logging
import os
import tarfile
import random
import subprocess
import socket
import base64
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
    devmonport = random.randint(1025, 60000) # TODO more properly find an available port
    appport = random.randint(1025, 60000)
    DEVMON = os.path.join(os.path.dirname(__file__), 'devmon.js')
    cmd = [DEVMON, str(devmonport), str(appport), appdir, 'node', 'app.js', str(appport)]
    child_env = os.environ.copy()
    child_env.update({'MONGO_ADDR': 'localhost'})
    p = subprocess.Popen(cmd, env=child_env)
    deployment_id = p.pid
    fake_database[deployment_id] = (p, devmonport)
    logger.info('127.0.0.1:%d' % devmonport + '\t' + deploy_data['url'])

    # this is just for dev mode/testing.
    deploy_data['_port'] = devmonport

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
    f = open(tar_path, "rb")
    try:
        s = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        host = deploy_data['hostname']
        port = deploy_data.get('_port', 80)
        s.connect((host, port))

        tarbin = base64.b64encode(f.read())
        s.sendall("POST /__update_code__ HTTP/1.1\n\n" + str(len(tarbin))+"\n\n")
        s.sendall(tarbin)
        s.recv(1)

        s.close()

    finally:
        f.close()
        os.remove(os.path.join(appdir, 'payload.tar'))


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
        dd = { 'hostname': '127.0.0.1',
               'url': 'http://127.0.0.1/' }
        d_id = provision(self.appdir, dd)
        p, port = fake_database[d_id]
        import time; time.sleep(2)
        print "Devmon pid=" + str(p.pid)
        r = requests.get('http://127.0.0.1:%d' % port)
        self.assertEqual(r.status_code, 200)

    def tearDown(self):
        shutil.rmtree(self.appdir)

class TestUpdateCode(unittest.TestCase):

    def setUp(self):
        self.appdir = codegen.write_to_tmpdir(codegen.compileApp(APPSTATE))
        dd = { 'hostname': '127.0.0.1',
               'url': 'http://127.0.0.1/' }
        d_id = provision(self.appdir, dd)
        p, port = fake_database[d_id]
        import time; time.sleep(2)
        print "Devmon pid=" + str(p.pid)
        r = requests.get('http://127.0.0.1:%d' % port)
        self.assertEqual(r.status_code, 200)

        self.dd = dd
        self.d_id = d_id

    def test_update_code(self):
        update_code(self.appdir, self.d_id, self.dd)

    def tearDown(self):
        shutil.rmtree(self.appdir)

if __name__ == "__main__":
    unittest.main()
