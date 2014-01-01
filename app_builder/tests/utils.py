import os, os.path
import unittest
from app_builder.analyzer.analyzer import App
from app_builder.controller import create_codes
from app_builder.coder import Coder, write_to_fs
from app_builder.app_manager import AppManager
import re
from splinter import Browser
from app_builder.app_manager import AppManager
import signal

MASTER_APP_STATE = os.path.join(os.path.dirname(__file__), "app_states", "master_state.json")

class BaseStateTestCase(unittest.TestCase):
    def setUp(self):
        import simplejson
        self.app_state = simplejson.load(open(MASTER_APP_STATE, 'r'))
        self.alter_base_state(self)
        self.app = App.create_from_dict(self.app_state)

    def alter_base_state(self):
        "Override this method to alter self.app_state before it gets parsed into an App object."
        pass


import requests, time

def ping_until_success(url, retries=8):
    "Holds up this process until a 200 is received from the server."
    tries = 0
    successful = False
    while not successful and tries < retries:
        try:
            print "Trying to connect to server"
            r = requests.get(url)
        except requests.exceptions.ConnectionError:
            pass
        else:
            successful = r.status_code == 200
        tries += 1
        time.sleep(1)
    if tries == retries:
        raise Exception("Tried to ping until 200, but just couldn't get that dough brah.")
    return


def get_a_port():
    pid = os.getpid()
    port = 9000 + (pid % 50000)
    return port

VENV_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "..", "appcubator-deploy", "child_venv"))
assert os.path.isdir(VENV_DIR)
class SplinterTestCase(unittest.TestCase):
    """
    Tests the codegen correctness by app state
    """
    def setUp(self):
        port = get_a_port()
        hostname = "testing.appcubator.com"
        url = "http://%s:%d/" % (hostname, port)

        def state_to_code(app_state):
            app = App.create_from_dict(app_state)
            codes = create_codes(app)
            coder = Coder.create_from_codes(codes)
            tmpdir = write_to_fs(coder)
            return tmpdir

        app_dir = state_to_code(self.__class__.APP_STATE)
        print "App deployed to %s" % app_dir

        # start the server
        am = AppManager(app_dir, venv_dir=VENV_DIR, settings_module='settings.dev')

        ret, out, err = am.run_command("python scripts/syncdb.py")
        self.p = am.Popen("python manage.py runserver %d" % port)
        self._app_manager = am

        # wait until server is ready
        ping_until_success(url)

        self.browser = Browser("chrome")
        self.prefix = url[:-1] # without the ending fwd slash
        self.url = lambda x: self.prefix + str(x)
        self.route = lambda x: x.replace(self.prefix, "")


    def tearDown(self):
        self.browser.quit()

        self._app_manager.run_command("python manage.py flush --noinput")

        # send sigterm to all processes in the group
        os.killpg(self.p.pid, signal.SIGTERM)
        self.p.wait()

