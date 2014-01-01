from app_builder import naming

from . import env


class DjangoStaticPagesTestCase(object):

    def __init__(self, identifier_url_pairs, namespace):
        self.identifier_url_pairs = identifier_url_pairs
        self.code_path = "webapp/tests.py"
        self.namespace = namespace

    def render(self):
        return env.get_template('tests/static_pages.py.template').render(test=self, imports=self.namespace.imports(), locals={})
