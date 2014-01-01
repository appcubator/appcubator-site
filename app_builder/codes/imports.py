from app_builder import naming

from . import env

class Import(object):

    def __init__(self, import_symbol, identifier, from_string=''):
        self.import_symbol = import_symbol
        self.identifier = identifier
        self.use_as = False
        if str(import_symbol) != str(identifier):
            self.use_as = True
        self.from_string = from_string

    def render(self):
        return env.get_template('import.py.template').render(imp=self)

    @classmethod
    def render_concatted_imports(self, imports):
        assert len(set([i.from_string for i in imports])) == 1, "These from strings ain't the same."
        from_string = imports[0].from_string
        return env.get_template('imports_concatted.py.template').render(from_string=from_string, imports=sorted(imports, key=lambda x: str(x.import_symbol)))
