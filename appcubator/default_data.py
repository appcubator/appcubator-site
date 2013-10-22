import os, os.path
import simplejson

DEFAULT_STATE_DIR = os.path.join(os.path.dirname(
    __file__), os.path.normpath("default_state"))


def get_default_data(filename):
    f = open(os.path.join(DEFAULT_STATE_DIR, filename))
    s = f.read()
    # makes sure it's actually valid
    simplejson.loads(s)
    f.close()
    return s

def get_default_app_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "app_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s


def get_default_theme_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "flat_ui_theme.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s

def get_default_uie_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "uie_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s


def get_default_mobile_uie_state():
    f = open(os.path.join(DEFAULT_STATE_DIR, "mobile_uie_state.json"))
    s = f.read()
    simplejson.loads(s)  # makes sure it's actually valid
    f.close()
    return s
