import unittest
from app_builder.analyzer import App
import random
import os.path
import glob
import simplejson

TABLE_NAME_LIST = ["Bottle", "Glass", "Spoon", "Screen", "Monitor", "Cable"]
USER_NAME_LIST = ["Admin", "Carpooler", "Driver", "Wizard", "PG", "VC"]
PRIM_FIELD_LIST = ["Name", "Number Of Kids", "Money In The Bank", "Brew", "Favorite Language", "T-Shirt Size"]
RELATED_NAME_FIELD_TYPES_LIST = ["Socks", "Trousers", "Tweet", "Keyboard"]
URLPART_LIST = ["profile", "barn", "beard", "pool", "notebook", "ryangosling"]

ALIGNMENT_LIST = ["left", "center", "right"]
FIELD_TYPES_LIST = ["number", "text", "image", "date", "email", "file"]
RELATIONAL_FIELD_TYPES_LIST = ["fk", "o2o", "m2m"]


class TestGenerator(object):

    def init_with_blank_state(self):
        module_dir = os.path.dirname(__file__)
        self.state = simplejson.loads(open(os.path.join(module_dir, 'app_states/master_state.json')).read())

    def get_all_app_states(self):
        app_states = {}
        for json in self.get_json_names():
            app_state = simplejson.loads(open(os.path.join(json)).read())
            # Gets the name of the json.
            state_name = json.split('/')[-1].split('.')[0]
            app_states[state_name] = App.create_from_dict(self.make_state(state=app_state))
        return app_states

    def get_json_names(self):
        """ Gets all the jsons in app_states directory. """
        module_dir = os.path.dirname(__file__)
        json_dir = os.path.join(module_dir, 'app_states/*.json')
        dirs = []
        for dir in glob.glob(json_dir):
            dirs.append(dir)
        return dirs

    def init_specific_state(self, json_file):
        module_dir = os.path.dirname(__file__)
        self.state = simplejson.loads(open(os.path.join(module_dir, 'app_states/%s' % json_file)).read())

    def make_state(self, state=None):
        if state is None:
            s = self.state
        else:
            s = state
        assert len(s['users']) == 1 and len(s['users'][0]['fields']) > 0, "blank json wasn't what i thought it was"

        return s

class IsComprehensiveTestCase(unittest.TestCase):
    """
        Each test case should have access to all apps, where apps is a dictionary that maps
        the filename (a descriptive name of the test dict) to the app_state json.
        In each test case we modify self.app which has a default value to master_state.json
    """
    
    def setUp(self):
        t = TestGenerator()
        t.init_with_blank_state()
        self.apps = t.get_all_app_states()
        self.d = t.make_state()
        self.app = App.create_from_dict(self.d)

    def test_all_app_states(self):
        pass

    def test_has_multiple_entities(self):
        pass

    def test_each_entity_has_multiple_primitive_fields_of_all_types(self):
        pass

    def test_each_entity_has_at_least_two_relational_fields(self):
        pass

    def test_all_relational_fields_occur_at_least_twice(self):
        pass

    def test_has_multiple_page(self):
        pass

    def test_have_pages_with_multiple_entities_in_context(self):
        pass

    def test_each_page_has_at_least_two_forms(self):
        pass

    def test_all_entities_have_create_forms(self):
        pass

    def test_some_create_forms_have_no_relations(self):
        pass

    def test_has_relational_create_form_involving_user(self):
        pass

    def test_has_relational_create_form_involving_page(self):
        pass

    def test_have_redirect_and_refresh(self):
        pass

if __name__ == '__main__':
    unittest.main()
