import os
import glob
import simplejson
from app_builder.analyzer import App

def get_json_names(root):
    names = []
    root_g = os.path.join(root, "*.json")
    for json_name in glob.glob(root_g):
        names.append(json_name)
    return names

class AppStateTestInterface():
    """ A simple class that mananges the json files (app_states)
        in the app_states directory. Support CRUD on these app_states
        and generates App objects from them if needed.
    """

    def __init__(self, app_state_dir=None, forge='app_states_tmp/'):
        module_dir = os.path.dirname(__file__)
        if app_state_dir is None:
            self.app_state_dir = os.path.join(module_dir, 'app_states/')
        else:
            self.app_state_dir = app_state_dir
        self.tmp_app_state_dir = os.path.join(module_dir, forge)
        self.app_states = get_json_names(self.app_state_dir)

    def get_num_app_states(self):
        return len(self.app_states)

    def get_app_states(self):
        return self.app_states

    def get_app(self, app_state):
        return App.create_from_dict(self.get_app_json(app_state))

    def add_app_state(self, json, name):
        f = open(os.path.join(self.app_state_dir, name), "w")
        f.write(simplejson.dumps(json))
        f.close()
        self.app_states.append(os.path.join(self.app_state_dir, name))

    def remove_app_state(self, app_state):
        fp = os.path.join(self.app_state_dir, app_state)
        if fp in self.app_states:
            os.remove(fp)
        self.app_states.remove(fp)

    def copy_and_add_app_state(self, app_state, name):
        self.add_app_state(self.get_app_json(app_state), name)

    def get_app_json(self, app_state):
        return simplejson.loads(
            open(os.path.join(self.app_state_dir,
                              '%s' % app_state)).read())

    def is_app_state_valid(self, app_state):
        s = self.get_app_json(app_state)
        return len(s['users']) == 1 and len(s['users'][0]['fields']) > 0

    def is_stable(self):
        for app_state in self.app_states:
            if not self.is_app_state_valid(app_state):
                return False
        return True

