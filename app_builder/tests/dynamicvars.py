import unittest
from app_builder.analyzer import Entity
from app_builder.dynamicvars import Translator

class UserTranslatingTestCase(unittest.TestCase):
    
    def setUp(self):
        userdict = {
            "name": "User",
            "fields": [
                {
                    "name": "username",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "First Name",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "Last Name",
                    "type": "text",
                    "required": True
                },
                {
                    "name": "Email",
                    "type": "text",
                    "required": True
                },
            ]
        }
        self.entities = [ Entity.create_from_dict(userdict) ]
        self.entities[0].is_user = True
        self.t = Translator(self.entities)

    def test_basic(self):
        first_name_field = self.t.v1script_to_app_component('CurrentUser.first_name')
        self.assertEqual(first_name_field, self.entities[0].find('fields/First Name', name_allowed=True))

if __name__ == "__main__":

    unittest.main()