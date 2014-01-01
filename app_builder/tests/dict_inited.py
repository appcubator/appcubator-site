import unittest
from app_builder.analyzer.dict_inited import DictInited, ValidationError
from copy import deepcopy
import re

class DictInitedTestCase(unittest.TestCase):

    def setUp(self):

        class C(DictInited):
            _schema = {"layout":{"_type":{}, "_mapping":{"top":{"_type":""}}}}

        class B(DictInited):
            _schema = {"a":{"_type":""},
                       "h":{"_type":C},
                       "i":{"_type":[], "_each": {"_one_of":[{"_type":C},{"_type":""}]}}
                       }

        class A(DictInited):
            _schema = {"a":{"_type":""},
                       "b":{"_type":0},
                       "c":{"_type":0.0},
                       "cc":{"_type":True},
                       "d":{"_type":[]},
                       "e":{"_type":[], "_each":{"_type":""}},
                       "f":{"_type":{}},
                       "g":{"_type":{}, "_mapping":{
                            "lol": {"_type":""}
                           }},
                       "h":{"_type":B},
                       "i":{"_type":[], "_each": {"_one_of":[{"_type":B},{"_type":C},{"_type":""}]}}
                       }

        self.A = A
        self.B = B
        self.C = C

        self.valid_data_dict = {
                       "a": "howdy",
                       "b": 1,
                       "c": 1.1,
                       "cc": False,
                       "d": ["hello",1,"world"],
                       "e": ["hello","world"],
                       "f": {"test":"ing", "123":True},
                       "g": { "lol": "string" },
                       "h": {"a": "hello", "h": {"layout":{"top":"hi"}}, "i":[{"layout":{"top":"hi"}}, "hi"]},
                       "i":[{"a": "hello", "h": {"layout":{"top":"hi"}}, "i":[{"layout":{"top":"hi"}}, "hi"]},
                            {"layout":{"top":"hi"}},
                            "hello"]
                       }

        self.obj = self.A.create_from_dict(self.valid_data_dict)

    def test_constructor(self):
        some_data = {"test":"ing",
                     "one" : 23 }
        obj = DictInited(**some_data)
        self.assertEqual(obj.test, "ing")
        self.assertEqual(obj.one, 23)

    def test_creation_works(self):
        obj = self.obj
        self.assertEqual(obj.a, "howdy")
        self.assertEqual(obj.b, 1)
        self.assertEqual(obj.c, 1.1)
        self.assertEqual(obj.cc, False)
        self.assertEqual(obj.d, ["hello",1,"world"])
        self.assertEqual(obj.e, ["hello","world"])
        self.assertEqual(obj.f, {"test":"ing", "123":True})
        self.assertEqual(obj.g, {"lol":"string"})

        self.assertIsInstance(obj.h, self.B)
        self.assertEqual(obj.h.a, "hello")
        self.assertEqual(obj.h.h.layout, {"top":"hi"})
        self.assertEqual(obj.h.i[0].layout, {"top":"hi"})
        self.assertIsInstance(obj.h.i[0], self.C)
        self.assertEqual(obj.h.i[1], "hi")

        self.assertIsInstance(obj.i[0], self.B)
        self.assertEqual(obj.i[0].a, "hello")
        self.assertEqual(obj.i[0].h.layout, {"top":"hi"})
        self.assertEqual(obj.i[0].i[0].layout, {"top":"hi"})
        self.assertIsInstance(obj.i[0].i[0], self.C)
        self.assertEqual(obj.i[0].i[1], "hi")

        self.assertIsInstance(obj.i[1], self.C)
        self.assertEqual(obj.i[1].layout, {"top":"hi"})

        self.assertEqual(obj.i[2], "hello")

    def test_creation_catches_type_errors(self):
        invalid_data_dict_a = deepcopy(self.valid_data_dict)
        invalid_data_dict_b = deepcopy(self.valid_data_dict)
        invalid_data_dict_c = deepcopy(self.valid_data_dict)
        invalid_data_dict_cc = deepcopy(self.valid_data_dict)
        invalid_data_dict_d = deepcopy(self.valid_data_dict)
        invalid_data_dict_e = deepcopy(self.valid_data_dict)
        invalid_data_dict_f = deepcopy(self.valid_data_dict)
        invalid_data_dict_g = deepcopy(self.valid_data_dict)
        invalid_data_dict_h = deepcopy(self.valid_data_dict)
        invalid_data_dict_i = deepcopy(self.valid_data_dict)

        invalid_data_dict_a["a"] = 1
        invalid_data_dict_b["b"] = "1"
        invalid_data_dict_c["c"] = "1"
        invalid_data_dict_cc["cc"] = "1"
        invalid_data_dict_d["d"] = 1
        invalid_data_dict_e["e"] = ["hello", 1]
        invalid_data_dict_f["f"] = 1
        invalid_data_dict_g["g"] = {"lol2": "wtf"}
        invalid_data_dict_h["h"]["a"] = 0
        invalid_data_dict_i["i"].append(0)

        invalid_data_dicts = [ invalid_data_dict_a
                              , invalid_data_dict_b
                              , invalid_data_dict_c
                              , invalid_data_dict_cc
                              , invalid_data_dict_d
                              , invalid_data_dict_e
                              , invalid_data_dict_f
                              , invalid_data_dict_g
                              , invalid_data_dict_h
                              , invalid_data_dict_i ]

        for d in invalid_data_dicts:
            try:
                self.A.create_from_dict(d)
            except Exception, e:
                for err in e.message:
                    self.assertIsInstance(err, ValidationError)
                    print err.msg, "\tpath: ", err.path

            else:
                self.assertTrue(False)


class ManipulateDictInitedTestCase(unittest.TestCase):

    def setUp(self):

        class B(DictInited):
            _schema = {
                "name": {"_type":""},
                "val": {"_type":""}
            }

        class C(DictInited):
            _schema = {
                "name": {"_type":""},
                "val": {"_type":""},
                "things": {"_type": [], "_each": {"_type":B}}
            }

        class A(DictInited):
            _schema = { "things": {"_type": [], "_each": {"_type":C}},
                        "some_dict": {"_type":{},
                                      "_mapping":{
                                          "test":{"_type": 0}}}}
        self.A = A
        self.B = B
        self.C = C
        self.obj = A.create_from_dict({
            'things': [{'name':'sup',
                        'val':'man',
                        'things':[{'name':'howyou', 'val':'doin'},{'name':'im', 'val':'fineyou?'}]},
                        {'name':'hello',
                         'val':'world',
                        'things':[{'name':'howyou', 'val':'doin'},{'name':'im', 'val':'fineyou?'}]}],
            'some_dict': {'test':1}
            })

    def test_find_works_on_dicts(self):
        self.assertIsInstance(self.obj.find(''), self.A)
        self.assertIsInstance(self.obj.find('some_dict'), dict)
        self.assertEqual(self.obj.find('some_dict/test'), 1)

    def test_find_works_on_arrays(self):
        self.assertIsInstance(self.obj.find('things/0'), self.C)

    def test_find_fails_on_array_no_index(self):
        self.assertRaises(Exception, self.obj.find, 'things/lol')

    def test_find_works_on_objs(self):
        self.assertEqual(self.obj.find('things/0/name'), "sup")

    def test_find_works_by_name(self):
        self.assertIsInstance(self.obj.find('things/sup', name_allowed=True), self.C)
        self.assertEqual(self.obj.find('things/sup/name', name_allowed=True), "sup")

    def test_find_works_by_name_nested(self):
        self.assertEqual(self.obj.find('things/sup/things/howyou', name_allowed=True).val, "doin")
        self.assertEqual(self.obj.find('things/sup/things/im', name_allowed=True).val, "fineyou?")

    def test_set_by_path(self):
        b_thing = self.obj.find('things/sup/things/im', name_allowed=True)
        self.obj.set_by_path('things/sup/things/im/val', 'APPCUBATOR')
        self.assertEqual(b_thing.val, 'APPCUBATOR')

    def test_find_fails(self):
        self.assertRaises(Exception, self.obj.find, 'g/randomstring')

    def test_iternodes(self):
        cnt = 0
        path_set = set()
        for path, obj in self.obj.iternodes():
            cnt += 1
            self.assertNotIn(path, path_set)
            path_set.add(path) # make sure these paths are unique
            self.assertEqual(self.obj.find(path), obj)

        # check that it actually iterated over 23 nodes.
        self.assertEqual(cnt, 23)

    def test_search(self):
        cnt = 0
        path_set = set()
        for path, obj in self.obj.search(r'things/\d+/things'):
            cnt += 1
            self.assertNotIn(path, path_set)
            path_set.add(path) # make sure these paths are unique
            self.assertTrue(re.search(r'things/\d+/things', path))
            self.assertEqual(self.obj.find(path), obj)

        # check that it actually iterated over 23 nodes.
        self.assertEqual(cnt, 14)




if __name__ == '__main__':
    unittest.main()
