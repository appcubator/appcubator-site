from app_builder import naming

from . import env


class DjangoURLs(object):
    """
    Represents a set of URL - function mappings.
    """

    def __init__(self, module_string, outer_namespace, urlpatterns_id, first_time=False, has_social=True, has_admin=False):
        """
        Module string = the string ref to the module that these URLs will belong to.
        Module namespace = the namespace this code will be dropped into

        """
        self.module = module_string
        self.outer_namespace = outer_namespace
        self.urlpatterns_id = urlpatterns_id

        self.routes = []
        self.code_path = "webapp/urls.py"
        self.first_time = first_time
        self.has_social = has_social
        self.has_admin = has_admin

    @property
    def namespace(self):
        # created to keep coder happy, since coder looks for a namespace to find imports in.
        return self.outer_namespace

    def render(self):
        return env.get_template('urls.py.template').render(urls=self, imports=self.outer_namespace.imports(), locals={'urlpatterns': self.urlpatterns_id}, kwargs_repr=repr, len=len)
