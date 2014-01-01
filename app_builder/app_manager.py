import os, os.path
import sys
import subprocess
import shlex


class AppManager(object):
    """
    >>> from app_manager import AppManager
    >>> app = AppManager('/var/folders/hz/pk9ss3_s21n7p14pm2hfb1k00000gp/T/tmp11Bdom',
            venv_dir='/Users/kssworld93/Projects/appcubator-deploy/child_venv',
            settings_module='settings.dev')
    >>> app.run_command('python manage.py test webapp')
    (0, "Creating test database...\n", 'Ran 1 test in 0.094s\n\nOK\n')
    """

    def __init__(self, app_dir, venv_dir=None, settings_module=None):
        """
        app_dir points to the root directory of the app
        venv_dir points to the directory of the virtualenv, kind of like PYTHONHOME
        settings_module is the DJANGO_SETTINGS_MODULE
        """
        self.app_dir = app_dir
        assert os.path.isdir(venv_dir), "The venv_dir you supplied is not a real directory: %r" % venv_dir
        self.venv_dir = venv_dir
        self.settings_module = settings_module

        self.setup_env()

    def setup_env(self):
        """
        sets self.env to the env dictionary, based on attributes in self.
        """
        # simulates it running as if you were cd-ed into the app dir, and sourced the venv
        self.env = { "PYTHONPATH": self.app_dir,
                     "PATH": os.path.join(self.venv_dir, "bin") + ":" + os.environ['PATH'],
                     "DJANGO_SETTINGS_MODULE": self.settings_module
                    }


    def Popen(self, cmd):
        p = subprocess.Popen(shlex.split(cmd), cwd=self.app_dir,
                                               env=self.env,
                                               stdout=subprocess.PIPE,
                                               preexec_fn=os.setpgrp,
                                               stderr=subprocess.PIPE)
        return p

    def run_command(self, cmd):
        """
        Runs command as if you cd-ed into the app dir, and sourced the venv
        Waits for the command to finish, so don't use this for interactive commands.
        Returns a tuple of return code, stdout, stderr
        """
        p = self.Popen(cmd)
        out, err = p.communicate()
        ret_code = p.returncode
        return (ret_code, out, err)

