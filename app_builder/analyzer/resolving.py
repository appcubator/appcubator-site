from dict_inited import DictInited
from utils import encode_braces, decode_braces
from datalang import parse_to_datalang
import pagelang
from pagelang import parse_to_pagelang
from . import UserInputError


class Resolvable(object):
    """
    Mixin allowing you to specify attributes you want to resolve.
    See _resolve_attrs in LinkLang for example.
    """

    def resolve(self):
        # this works for list, the resolve_data and resolve_page don't yet, unfortunately.
        assert hasattr(self, 'app'), "You must have something at attribute \"app\""
        for src_attr, dest_attr in self.__class__._resolve_attrs:
            if type(getattr(self, src_attr)) in [list, tuple]:
                dest_list = []
                for src_thing in getattr(self, src_attr):
                    path_string = decode_braces(src_thing)
                    try:
                        dest_list.append(self.app.find(path_string, name_allowed=True))
                    except DictInited.FindFailed:
                        raise UserInputError("You deleted or changed something, but there are still references to those things. Please fix them.", self._path)

                setattr(self, dest_attr, dest_list)
            else:
                try:
                    path_string = decode_braces(getattr(self, src_attr))
                    setattr(self, dest_attr,  self.app.find(path_string, name_allowed=True))
                except DictInited.FindFailed:
                    raise UserInputError("You deleted or changed something, but there are still references to those things. Please fix them.", self._path)

    def resolve_data(self):
        if not hasattr(self.__class__, '_datalang_attrs'):
            return
        assert hasattr(self, 'app'), "You must have something at attribute \"app\""
        for src_attr, dest_attr in self.__class__._datalang_attrs:
            datalang_string = getattr(self, src_attr)
            try:
                dl = parse_to_datalang(datalang_string, self.app)
            except DictInited.FindFailed:
                raise UserInputError("You deleted or changed a field or table, but old references to those things still exist. Please fix them.", self._path)
            setattr(self, dest_attr, dl)

    def resolve_page(self):
        if not hasattr(self.__class__, '_pagelang_attrs'):
            return
        assert hasattr(self, 'app'), "You must have something at attribute \"app\""
        for src_attr, dest_attr in self.__class__._pagelang_attrs:
            pagelang_string = getattr(self, src_attr)
            try:
                pl = parse_to_pagelang(pagelang_string, self.app)
            except DictInited.FindFailed:
                raise UserInputError("You deleted or changed something, but there are still references to those things. Please fix them.", self._path)
            except pagelang.UrlDataMismatch:
                raise UserInputError("Url data mismatch in pagelang", self._path)
            except AssertionError:
                raise UserInputError("Please fix the URL so that it starts with http, https, or mailto.", self._path)
            setattr(self, dest_attr, pl)


        # 4. later on in code generation, the datalang will be converted to code
        #      by providing a page and loop context and hoping for the best.


class EntityLang(DictInited, Resolvable):
    _schema = {"entity_name": {"_type": ""}}
    _resolve_attrs = (('entity_name', 'entity'),)

    """
    # datalang is going to be an ORM-like query language.:
    page.Tweet.content.whatever blah blah
    CurrentUser.First Name
    Student.grades

    # new link lang is going to be:
    internal://<page name>/?<urldata type>=<datalang> & so on.
    its equivalent to:

        {
            page_name: ""    # resolvable to page
          , urldata: {
                <entity name>: <datalang>    # key is resolvable to entity, value is resolvable to some datalang
            }
        }
    """
