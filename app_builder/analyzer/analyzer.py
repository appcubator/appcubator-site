# -*- coding: utf-8 -*-

import re


from dict_inited import DictInited
from utils import encode_braces, decode_braces
from resolving import Resolvable, EntityLang
from copy import deepcopy

from . import env
from . import UserInputError
from . import assert_raise

from app_builder.analyzer import logger
from .. import naming

"""
  Consists of each type of front facing primitive. This can range from different type
  of fields, pages etc.

  Each field contains a schema that specifies what the app_state for that primitive
  must contain. Each field must have a _type that specifies its type. This can be
  prefixed with _one_of to specify different types. For lists, we use _each to
  signify its element's types.

  ((src1,dst1), (src2, dst2), ...) is a way of specifying how src_i gets resolved to
  dst_i for primitives that may need attributes resolved. This is stored in _resolve_attrs
"""


# tables

class EntityField(DictInited):
    _schema = {
        "name": {"_type": ""},
        "type": {"_type": ""}
    }

    def is_relational(self):
        return False

    def get_property(self, datalang):
        "datalang may refer to a relational field that this field has. Get it and return it."

    def set_django_access_id(self, some_identifier):
        self._django_field_id = some_identifier

    def get_django_access_id(self):
        return self._django_field_id


    def get_translation(self, datalang):
        """Returns a lambda which will evaluate to the tranlation.
           Notice that it is calling get_transation of another method,
            and eval-ing it upon the returned lambdas evaluation."""
        return lambda: '%s.%s' % (self.get_django_access_id(), self.get_property(datalang).get_translation(datalang)()) # whatup function linked list continuation!


class EntityRelatedField(DictInited, Resolvable):
    _schema = {
        "name": {"_type": ""},
        "type": {"_type":""}, # one to one, many to one, many to many
        "entity_name": {"_type" : ""},
        'related_name': {"_type": ""}
    }
    _resolve_attrs = (('entity_name', 'entity'),)

    def is_relational(self):
        return True

    def __init__(self, *args, **kwargs):
        super(EntityRelatedField, self).__init__(*args, **kwargs)
        self.entity_name = encode_braces('tables/%s' % self.entity_name)

    def get_property(self, datalang):
        "return the property that datalang is referring to. a property is something that has a django access id, and can get translation"
        "datalang refers to some relational field, either by ways of related name or field name. return that child."

    def set_django_access_id(self, some_identifier):
        self._django_field_id = some_identifier

    def get_django_access_id(self):
        return self._django_field_id

    def get_translation(self, datalang):
        """Returns a lambda which will evaluate to the tranlation.
           Notice that it is calling get_transation of another method,
            and eval-ing it upon the returned lambdas evaluation."""
        return lambda: '%s.%s' % (self.get_django_access_id(), self.get_property(datalang).get_translation(datalang)()) # whatup function linked list continuation!


class Entity(DictInited):
    _schema = {
        "name": {"_type": ""},
        "fields": {"_type": [], "_each": {"_one_of":[{"_type": EntityRelatedField}, {"_type": EntityField}]}},
    }

    def __init__(self, *args, **kwargs):
        super(Entity, self).__init__(*args, **kwargs)
        self.is_user = False

    def relational_fields(self):
        return filter(lambda x: x.is_relational(), self.fields)

    def get_property(self, datalang):
        "return the property that datalang is referring to. a property is something that has a django access id, and can get translation"
        "datalang refers to some relational field, either by ways of related name or field name. return that child."
        # return some field matching datalang

    def set_django_access_id(self, some_identifier):
        self._django_model_id = some_identifier

    def get_django_access_id(self):
        return self._django_model_id

    def get_translation(self, datalang):
        """Returns a lambda which will evaluate to the tranlation.
           Notice that it is calling get_transation of another method,
            and eval-ing it upon the returned lambdas evaluation."""
        return lambda: '%s.%s' % (self.get_django_access_id(), self.get_property(datalang).get_translation(datalang)()) # whatup function linked list continuation!


class UserRole(DictInited):
    _schema = {
        "name": {"_type":""}, # TODO
        "fields": {
            "_type": [],
            "_each": {"_one_of":[{"_type": EntityRelatedField}, {"_type": EntityField}]}
        }
    }


# Pages

class Navbar(DictInited):

    class NavbarItem(DictInited, Resolvable):

        _schema = {
            "url": {"_type": ""},
            "title": { "_type": "" }
        }

        _pagelang_attrs = (('url', 'url_pl'),)
        _resolve_attrs = ()

        def validate(self):
            """ Prevent /admin/ conflicts """
            if "internal://" in self.url:
                admin_check = self.url[len("internal://"):].lower()
                return admin_check is not "admin" and admin_check is not "admin/"

        def is_current_page(self, page):
            return self.url_pl.page is page

        def visit_strings(self, f):
            self.title = f(self.title)

    _schema = {
        "brandName": {"_one_of": [{"_type": ""}, {"_type": None}]},
        "version": {"_type": 0, "_default":1},
        "isHidden": {"_type": True},
        "links": {"_type": [], "_each": {"_type": NavbarItem}}
    }

    def render(self, parent_page):
        if self.brandName is None:
            self.brandName = self.app.name
        if self.version == 1:
            return env.get_template('navbar-old.html').render(navbar=self, page=parent_page)
        elif self.version == 2:
            return env.get_template('navbar.html').render(navbar=self, page=parent_page)
        else:
            assert False

    def visit_strings(self, f):
        if self.brandName is not None:
            self.brandName = f(self.brandName)
        for l in self.links:
            l.visit_strings(f)

class Footer(DictInited):

    class FooterItem(DictInited, Resolvable):
        _schema = {
            "url": {"_type": ""},
            "title": { "_type": "" }
        }

        _pagelang_attrs = (('url', 'url_pl'),)
        _resolve_attrs = ()

        def visit_strings(self, f):
            self.title = f(self.title)

    _schema = {
        "customText": {"_type": ""},
        "isHidden": {"_type": True},
        "version": {"_type": 0, "_default":1},
        "links": {"_type": [], "_each": {"_type": FooterItem}}
    }

    def render(self):
        if self.version == 1:
            return env.get_template('footer-old.html').render(footer=self)
        elif self.version == 2:
            return env.get_template('footer.html').render(footer=self)
        else:
            assert False

    def visit_strings(self, f):
        self.customText = f(self.customText)
        for l in self.links:
            l.visit_strings(f)

from uielements import UIElement

class Page(DictInited):

    class URL(DictInited):


        _schema = {
            "urlparts": {"_type": [], "_each": {"_type": ""}},
            "entities": {"_type": [], "_each": {"_type": EntityLang}, "_default": deepcopy([])}
        }
        # Entities hack - frontend doesn't know about this array, so it will be default inited to [].
        # then init function will populate it with EntityLang instances 
        # later on, someone (analyzer post-init) will iternodes over this and resolve all the entitylangs.


        def __init__(self, *args, **kwargs):
            """Filters out brace-encoded strings and puts them in a separate array called entities.
            Fills in the gaps of urlparts with None, so we know that an entity was there"""
            super(Page.URL, self).__init__(*args, **kwargs)
            assert len(self.entities) == 0, "Frontend shouldn't know about this..."
            for idx, u in enumerate(self.urlparts):
                try:
                    entity_name = decode_braces(u)
                except AssertionError:
                    # means this is a normal string (not in braces), part of the url
                    pass
                else:
                    # none will indicate that an ID reference was here.
                    self.urlparts[idx] = None
                    self.entities.append(EntityLang(entity_name=
                                encode_braces('tables/%s' % entity_name)))

        def is_valid(self):
            for u in self.urlparts:
                try:
                    if not re.match(r'^[a-zA-Z0-9-_]+$', u):
                        logger.error("Page URL %s is not valid." % u)
                        return False
                    # Prevent /admin/ conflicts
                    if u == "admin" or u == "admin/":
                        return False

                except TypeError:
                    logger.info("Page URL %s encountered TypeError" % u)
            return True


    _schema = {
        "name": {"_type": ""},
        "url": {"_type": URL},
        "navbar": {"_type": Navbar},
        "footer": {"_type": Footer},
        "uielements": {"_type": [], "_each": {"_type": UIElement}},
        "access_level": {"_type": ""}
    }

    def __init__(self, *args, **kwargs):
        super(Page, self).__init__(*args, **kwargs)
        self.id_namespace = naming.Namespace()

    @property
    def url_regex(page):
        url_regex = "r'^"
        for x in page.url.urlparts:
            if isinstance(x, basestring):
                url_regex += x + '/'
            else:
                url_regex += r'(\d+)/'
        url_regex += "$'"
        return url_regex

    def is_static(self):
        # returns true iff there are no tables in the url parts
        return [] == filter(lambda x: x is None, self.url.urlparts)

    def get_tables_from_url(self):
        return [entlang.entity for entlang in self.url.entities]


class Email(DictInited):
    _schema = {
        "name": {"_type": ""},
        "subject": {"_type": ""},
        "content": {"_type": ""},
    }

# Put it all together, you get an App

from uielements import Form, Iterator

class App(DictInited):
    _schema = {
        "name": {"_type": "", "_minlength": 1, "_maxlength": 255},
        "info": {"_type": {}, "_mapping": {
            "description": {"_type": ""},
            "keywords": {"_type": ""},
        }},
        "users": {"_type": [], "_each": {"_type": UserRole}},
        "tables": {"_type": [], "_each": {"_type": Entity}},
        "pages": {"_type": [], "_each": {"_type": Page}},
        "emails": {"_type": [], "_each": {"_type": Email}},
    }

    def __init__(self, *args, **kwargs):
        self._path = ""
        super(App, self).__init__(*args, **kwargs)

    @classmethod
    def create_from_dict(cls, data, api_key=None,*args, **kwargs):
        # preprocess data
        self = super(App, cls).create_from_dict(data, *args, **kwargs)
        self.api_key = api_key

        for p in self.pages:
            assert_raise(p.url.is_valid(),
                    UserInputError("This URL is invalid. URLs must only contain letters, numbers, underscores and hyphens.", p.url._path))

        """
        Backend User role strategy: combine all the roles into one user model, and create a role field to tell roles apart.
        In analyzer:
            First validate that user role duplicated fields have the same type.
            Make an table per user role and add to tables array
            Make a table with all the combined fields and put in a separate attribute called userentity
        In datalang, normalize to CurrentUser.
        For redirects, replace redirect portion of the code with some logic
        """
        assert_raise(len(self.users) > 0, UserInputError("You can\'t remove all Users, you need to have at least one User.", "users"))
        # create the user entity based on userconfig
        base_userdict = {
            "name": "User",
            "fields": [
                {
                    "name": "username",
                    "type": "text",
                },
                {
                    "name": "First Name",
                    "type": "text",
                },
                {
                    "name": "Last Name",
                    "type": "text",
                },
                {
                    "name": "Email",
                    "type": "text",
                },
            ]
        }
        self.multiple_users = len(self.users) > 1

        # pretend the user added a _role field (type text)
        if self.multiple_users:
            base_userdict['fields'].append({"name":"_role", "type":"text"})

        # dict -> App
        userentity = Entity.create_from_dict(base_userdict)
            # bind user_role_field to app for convenience
            # define the standard username first name etc fields as "user fields" (Because they'll be in django user model)
        if self.multiple_users:
            user_role_field = [ f for f in userentity.fields if f.name == '_role' ][0] # linear search
            self.user_role_field = user_role_field
            userentity.user_fields = [f for f in userentity.fields if f is not user_role_field] # create a new list, bc the old one is mutated later
        else:
            userentity.user_fields = [f for f in userentity.fields] # create a new list, bc the old one is mutated later

        # for all the fields in all the users, dump them together
        #   in preparation for next step: deduping.
        combined_fields_from_all_roles = []
        for u in self.users:
            combined_fields_from_all_roles.extend(u.fields)

        # deduplicate by name to get the total set of fields that the userprofile will have.
        user_profile_field_set = [] # <- this will contained the deduped set of user-added fields
        dupe_user_field_set = [] # this is for remember which were duplicated, so we can fix the entity -> field reference (true deduping)
        for field in combined_fields_from_all_roles:
            dupe = False
            for already_added_field in user_profile_field_set:
                if field.name == already_added_field.name:
                    dupe = True
                    dupe_user_field_set.append((field, already_added_field))
                    assert_raise(field.type == already_added_field.type,
                            UserInputError("You changed the type of the field in this user, but a field with the same name has a different type in another user. Please make the types the same or delete the field and create a new one with a different name.", field._path))
                    break
            if not dupe:
                user_profile_field_set.append(field)

        for u in self.users:
            for idx, f in enumerate(u.fields):
                for dupe_field, relabel_target_field in dupe_user_field_set:
                    if f is dupe_field:
                        u.fields[idx] = relabel_target_field


        if self.multiple_users:
            userentity.user_profile_fields = user_profile_field_set + [user_role_field]
        else:
            userentity.user_profile_fields = user_profile_field_set

        userentity.fields = userentity.user_fields + userentity.user_profile_fields

        userentity.is_user = True
        userentity.role_names = [ u.name for u in self.users ]

        # create a table for each user
        for u in self.users:
            user_inst = Entity.create_from_dict({'name': u.name, 'fields': deepcopy([])})
            user_inst.fields.extend(userentity.user_fields) # first add the common fields (mem references to avoid duplication of data)
            user_inst.fields.extend(u.fields) # then extend with this user role custom fields
            user_inst.is_user = True
            self.tables.append(user_inst)
        #self.tables.append(userentity) # old code
        self.userentity = userentity

        # HACK replace uielements with their subclass
        for p in self.pages:
            uies = []
            for uie in p.uielements:
                subclass = uie.subclass
                uies.append(subclass)
                subclass.page = p
                for path, e in subclass.iternodes():
                    try:
                        e._page = p
                    except AttributeError:
                        pass

            p.uielements = uies

        for path, row in self.search(r'pages/\d+/uielements/\d+/container_info/row$'):
            uies = []
            for uie in row.uielements:
                subclass = uie.subclass
                subclass.page = row._page
                uies.append(subclass)
            row.uielements = uies

        for p, e in self.search(r'^pages/\d+/uielements/\d+'):
            try:
                e._path = p
            except AttributeError:
                pass

        # HACK give everything a reference to the app
        for path, obj in filter(lambda u: isinstance(u[1], DictInited), self.iternodes()):
            obj.app = self

        # Fix reflang namespaces
        for path, fii in filter(lambda n: isinstance(n[1], Form.FormInfo.FormInfoInfo), self.iternodes()):
            fii.entity = encode_braces('tables/%s' % fii.entity)

        for path, ii in filter(lambda n: isinstance(n[1], Iterator.IteratorInfo), self.iternodes()):
            ii.entity = encode_braces(
                'tables/%s' % ii.entity)  # "Posts" => "tables/Posts"

        for path, rl in filter(lambda n: isinstance(n[1], Resolvable), self.iternodes()):
            rl.resolve()
        for path, rl in filter(lambda n: isinstance(n[1], Resolvable), self.iternodes()):
            rl.resolve_data()
        for path, rl in filter(lambda n: isinstance(n[1], Resolvable), self.iternodes()):
            rl.resolve_page()

        # Second order validations
        for path, obj in filter(lambda n: isinstance(n[1], object), self.iternodes()):
            if hasattr(obj, 'validate'):
                obj.validate()


        return self
