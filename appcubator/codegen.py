import requests
from django.conf import settings
import json
import tempfile
import os, os.path


# backwards compatibility
class UserInputError(Exception):
    def __init__(self, message, path):
        """
        Takes a human-readable error and the path where the problem occurred.
        """
        self.message = message
        self.path = path

    def to_dict(self):
        return {'message': self.message,
                'path': self.path }

    def __unicode__(self):
        return self.__str__()

    def __str__(self):
        return "%s\nPath: %s" % (self.message, self.path)

def expandOnce(plugins, generators, genref):
    r = requests.post(settings.CODEGEN_ADDR + '/expandOnce/', data=json.dumps([plugins, generators, genref]), headers={'Content-Type':'application/json'})
    if r.status_code == 200:
        return r.json()
    else:
        print r.status_code
        print r.text
        raise Exception(r.text)

def expand(plugins, generators, genref):
    r = requests.post(settings.CODEGEN_ADDR + '/expand/', data=json.dumps([plugins, generators, genref]), headers={'Content-Type':'application/json'})
    if r.status_code == 200:
        return r.json()
    else:
        print r.status_code
        print r.text
        raise Exception(r.text)

def expandAll(app):
    r = requests.post(settings.CODEGEN_ADDR + '/expandAll/', data=json.dumps(app), headers={'Content-Type':'application/json'})
    if r.status_code == 200:
        return r.json()
    else:
        print r.status_code
        print r.text
        raise Exception(r.text)

def compileApp(app, css=''):
    assert isinstance(app, dict)
    app['css'] = css
    r = requests.post(settings.CODEGEN_ADDR + '/compile/', data=json.dumps(app), headers={'Content-Type':'application/json'})
    if r.status_code == 200:
        return r.json()
    else:
        print r.status_code
        print r.text
        raise Exception(r.text)

def less(less_string):
    r = requests.get(settings.CODEGEN_ADDR + '/less/', data={'less':less_string})
    if r.status_code == 200:
        return r.text
    else:
        print r.status_code
        print r.text
        raise Exception(r.text)

def write_to_tmpdir(codeData):
    tmpdir = tempfile.mkdtemp(prefix='tmp-appcodegen-')
    files_to_write = [] # each entry will be a tuple of rel. path - content. content is a string (file) or dict (directory).
    files_to_write.extend(codeData.items())
    while len(files_to_write) > 0:
        relpath, content = files_to_write.pop()
        if isinstance(content, basestring):
            with open(os.path.join(tmpdir, relpath), 'w') as f:
                f.write(content.encode('utf-8'))
        else:
            os.makedirs(os.path.join(tmpdir, relpath))
            files_to_write.extend([(os.path.join(relpath, filename), subcontent) for filename, subcontent in content.iteritems() ])

    return tmpdir

import unittest


class CodegenIntegrationTest(unittest.TestCase):

    def test_expandOnce(self):
        genref = {'generate': 'routes.staticpage', 'data': {'templateName':'Homepage'}}
        route = expandOnce([], genref)
        self.assertIn('code', route)

    def test_expand(self):
        generators = {'testing': {
                        'testing': [{"name":"testing",
                                   "version":"0.1",
                                   "code":"""function(){return {generate:'testing.testing.testing2', data:null};}""",
                                   "templates":{},
                                },{"name":"testing2",
                                   "version":"0.1",
                                   "code":"function(){return 'success';}",
                                   "templates":{},
                                }] } }
        genref = {'generate': 'testing.testing.testing', 'data': {'templateName':'Homepage'}}
        result = expand([], generators, genref)
        self.assertEqual(result, 'success')

    def test_expandAll(self):
        from appcubator.default_data import get_default_app_state
        sampleApp = json.loads(get_default_app_state())
        app = expandAll(sampleApp)
        self.assertTrue(isinstance(app, type({})))

    def test_compileApp(self):
        from appcubator.default_data import get_default_app_state
        sampleApp = json.loads(get_default_app_state())
        code_data = compileApp(sampleApp)
        print code_data

    def test_writeTmpDir(self):
        from appcubator.default_data import get_default_app_state
        sampleApp = json.loads(get_default_app_state())
        code_data = compileApp(sampleApp)

        print write_to_tmpdir(code_data)

