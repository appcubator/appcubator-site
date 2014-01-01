from datalang import parse_to_datalang
import re
from . import assert_raise
from dict_inited import DictInited

class UrlDataMismatch(Exception):
    pass

"""
    Pagelang parsing and intermediate representation.
    Used to validate and convert link strings to renderable objects.
    This is done via either rendering the objects in python code (using reverse)
    or in template code (using url tag)
"""

class PageLang(object):
    def __init__(self, page_str, app, page_name=None, entity_datalang_map=None, external=False):
        """datalangs is a map from entity to it's datalang in the pagelang. it must be in the context of the target page"""
        self.entity_datalang_map = entity_datalang_map
        self.page_str = page_str
        self.is_external = external
        self.page_name = page_name
        if self.is_external:
            # Since this is an external link, we set page to None
            self.page = None
            assert self.entity_datalang_map is None, "External link, don't pass datalangs to this."
        else:
            self.page = app.find("pages/%s" % page_name, name_allowed=True)

            # check that the data on the page matches the data in this pagelang.
            entities_on_page = self.page.get_tables_from_url()
            assert_raise(len(entities_on_page) == len(self.entity_datalang_map), UrlDataMismatch("Number of url arguments passed doesn't match."))
            for e in entities_on_page:
                assert_raise(e in self.entity_datalang_map, UrlDataMismatch("Entity %r in page URL but not given in this pagelang" % e.name))

    def to_code(self, context=None, template=True, seed_id=None):
        """ If template is false reverse is used otherwise we return the URL template tag """
        if self.is_external:
            if template:
                return self.page_str
            return repr(self.page_str)

        datalang_variable_string = ''.join(['%s.id ' % self.entity_datalang_map[e].to_code(context=context, seed_id=seed_id) for e in self.page.get_tables_from_url()])
        if not template:
            arg_ids = datalang_variable_string.split()
            if len(list(arg_ids)) > 0:
                args_str = ", args=(%s)" % ''.join([ s + ', ' for s in arg_ids])
            else:
                args_str = ""
            code = "reverse('webapp.pages.%s'%s)" %(self.page._django_view.identifier, args_str)
            return code
        else:
            return "{%% url \"webapp.pages.%s\" %s%%}" % (self.page._django_view.identifier, datalang_variable_string)

def parse_lang(pagelang_string):
    """Given a string, try to parse out the page name and k, v pairs of the querystring after it."""
    if pagelang_string is None or pagelang_string == "": import pdb; pdb.set_trace()

    # subtle bug - internal://Tweet Page?Tweet=Wassup is still valid, b.c i made the slash before ? optional. no one has to know.
    m = re.match(r'^internal:\/\/([^\/]+)\/?(\?[^&=\/]+=[^&=\/]+(&[^&=\/]+=[^&=\/]+)*?)?$', pagelang_string)
    assert m is not None, "Invalid pagelang: %r" % pagelang_string
    page_name = m.group(1)

    # remove ?mark from beginning, then split on ampersand, then on equal sign.
    # ?a=b&c=d => [(a,b),(c,d)]
    if m.group(2) is None:
        qs_params = []
    else:
        qs_params = [ (x.split('=')[0], x.split('=')[1]) for x in m.group(2)[1:].split('&') ]

    return page_name, qs_params


def parse_to_pagelang(pagelang_string, app):
    """
    Parses pagelang strings of these types:
    http://google.com/
    https://gmail.com/
    internal://homepage/ (no datalang)
    internal://Tweet_page/?Tweet=loop.Tweet& ... qstring (datalang)
    """
    if not pagelang_string.startswith("internal://"):
        if (not pagelang_string.startswith("http://")) \
                and (not pagelang_string.startswith("mailto://"))\
                and (not pagelang_string.startswith("https://")):
            # fix the user's dumb mistake
            if (".com" in pagelang_string or ".org" in pagelang_string) and "/" in pagelang_string:
                # it's probably a link?
                pagelang_string = "http://" + pagelang_string
            else:
                # it's just normal text
                raise AssertionError()

        return PageLang(pagelang_string, app, external=True)
    else:
        page_name, datalang_data = parse_lang(pagelang_string)

        entity_datalang_map = {}
        for entity_name, datalang_str in datalang_data:
            entity = app.find('tables/%s' % entity_name, name_allowed=True)
            entity_datalang_map[entity] = parse_to_datalang(datalang_str, app)


        return PageLang(pagelang_string, app, page_name=page_name, entity_datalang_map=entity_datalang_map)
