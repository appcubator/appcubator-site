import unittest
from app_builder import analyzer

class RelatedEntitiesTestCase(unittest.TestCase):
    def setUp(self):
        app_dict = {
            'info': {
                'description':'',
                'keywords':''
            },
            'users': {
                "facebook": False,
                "linkedin": False,
                "twitter": False,
                "local": True,
                "fields": []
            },
             'entities': [{
                    'name':'Class',
                    'fields': [{
                            'name':'Name',
                            'required':True,
                            'type':'text'
                        },{
                            'name':'Description',
                            'required':True,
                            'type':'text'
                        },{
                            'name':'Professor',
                            'required':True,
                            'type': 'fk',
                            'entity_name': 'Teacher',
                            'related_name': 'Classes'
                        }]
                },{
                    'name':'Teacher',
                    'fields': [{
                            'name':'Name',
                            'required':True,
                            'type':'text'
                        },{
                            'name':'Bio',
                            'required':True,
                            'type':'text'
                        },{
                            'name':'Favorite student',
                            'required':True,
                            'type':'o2o',
                            'entity_name': 'Student',
                            'related_name': 'teacher'
                        }]
                },{
                    'name':'Student',
                    'fields': [{
                            'name':'Name',
                            'required':True,
                            'type':'text'
                        },{
                            'name':'Bio',
                            'required':True,
                            'type':'text'
                        },{
                            'name': 'Classes',
                            'required':True, # actually this makes no sense for m2m
                            'entity_name':'Class',
                            'type': 'm2m',
                            'related_name': 'enrolled students'
                        }]
                }],
            'pages': [],
            'name': "test app",
            "emails": []
        }

        self.app = analyzer.App.create_from_dict(app_dict)

    def test_resolved(self):
        self.assertIsInstance(self.app.entities[0].fields[2].entity, analyzer.Entity)

    def test_is_relational(self):
        self.assertTrue(self.app.entities[0].fields[2].is_relational())
        self.assertFalse(self.app.entities[0].fields[1].is_relational())
if __name__ == '__main__':
    unittest.main()