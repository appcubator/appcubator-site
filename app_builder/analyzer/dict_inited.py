""" Really cool JSON schema validator """

from copy import deepcopy
import re
from app_builder.codes.utils import FnCodeChunk


class ValidationError(object):
    """Represents a validation error"""

    def __init__(self, msg, thing, schema, ancestor_list):
        self.msg = msg
        self.thing = thing
        self.schema = schema
        self.path = '/'.join([unicode(i) for i in ancestor_list])

    def __unicode__(self):
        return u"Error found in %r: %r\n(Thing, Schema) = %r" % (self.path, self.msg, (self.thing, self.schema))

    def __str__(self):
        return self.__unicode__()

class InvalidDict(Exception):
    # uses parent init which takes 1 positional argument and stores in self.message

    def __str__(self):
        return '\n\n'.join([unicode(e) for e in self.message])


class DictInited(object):
    """Base class for dict_inited objects.
    Includes creation code and validation code"""

    _schema = {}

    def __init__(self, **kwargs):
        """Inits this object with the data passed. Very standard."""
        data = kwargs
        assert isinstance(data, dict), "Input to init must be a dict"
        for name, value in data.items():
            setattr(self, name, value)


    @classmethod
    def _recursively_create(cls, thing, schema, data_only=False):
        """Returns the object created version of thing if schema type is a class, else returns thing.
             Does a recursive DFS, mutating as it goes"""

        if '_one_of' in schema:
            for validation_schema in schema['_one_of']:  # FIXME there might be more than 1 correct schema, then it's ambiguous
                # try all the schemas until one works. if none work, throw an
                # error and quit.
                new_errs = cls.validate_dict(thing, validation_schema, [])
                if len(new_errs) == 0:
                    return cls._recursively_create(thing, validation_schema, data_only=data_only)
            # if you get to this point, none of the "one of" things were valid.
            raise Exception("thing does not ascribe to schema")

        try:
            assert('_type' in schema)
        except Exception:
            raise Exception('schema structure doesn\'t begin with _type')

        if type(schema['_type']) == type(type):
            data = schema['_type']._recursively_create(thing, {
                                                       "_type": {}, "_mapping": schema['_type']._schema}, data_only=data_only)
            if data_only:
                return data
            else:
                return schema['_type'](**data)

        if type(thing) == type(""):
            thing = unicode(thing)

        assert type(thing) == type(schema['_type']) or (type(thing) == type(
            u"") and type(schema['_type']) == type("")), "thing does not ascribe to schema"

        if type(thing) == type([]):
            if '_each' not in schema:
                return thing

            return [cls._recursively_create(minithing, schema['_each'], data_only=data_only) for minithing in thing]

        elif type(thing) == type({}):
            if '_mapping' not in schema:
                return thing

            for key, value in thing.items():
                if key not in schema['_mapping']:
                    del thing[key]
                else:
                    thing[key] = cls._recursively_create(
                        thing[key], schema['_mapping'][key], data_only=data_only)

            return thing

        elif type(thing) in [unicode, int, float, bool]:
            return thing

        elif thing is None:
            assert(schema['_type'] is None)
            return thing

        else:
            raise Exception("type not recognized: {}".format(thing))

        return thing

    @classmethod
    def create_from_dict(cls, data, dict_only_mode=False):
        """
        Validates the data,
          then inits the object recursively.
        """
        assert isinstance(
            data, dict), "Input to \"created_from_dict\" must be a dict"
        errors = cls.validate_dict(data, {"_type": cls}, [])
        if len(errors) != 0:
            raise InvalidDict(errors)

        data = deepcopy(data)
        o = cls._recursively_create(data, {
                                    "_type": cls}, data_only=dict_only_mode)  # helper function needed for schema based recursion
        # set the path on each thing
        for path, obj in o.iternodes():
            try:
                obj._path = path
            except AttributeError:
                pass
        return o

    @classmethod
    def validate_dict(cls, thing, schema, ancestor_list):
        """Return a list of error messages. if there are no errors, the thing successfully validate_dict, no problemo."""

        errors = []

        if '_one_of' in schema:
            sub_errors = []
            for validation_schema in schema['_one_of']:
                new_errs = cls.validate_dict(
                    thing, validation_schema, ancestor_list)
                sub_errors.extend(new_errs)
                if len(new_errs) == 0:
                    return errors
            # if you get to this point, none of the "one of" things were valid.
            errors.extend(sub_errors)
            # errors.append(ValidationError("None of the _one_of things
            # matched.", thing, schema, ancestor_list))
            return errors
        assert '_one_of' not in schema

        # make sure the type of the thing matches with the schema
        try:
            assert('_type' in schema)
        except Exception:
            raise Exception('schema structure doesn\'t begin with _type')

        if type(schema['_type']) == type(type):
            assert issubclass(schema['_type'], DictInited)
            return cls.validate_dict(thing, {"_type": {}, "_mapping": schema['_type']._schema}, ancestor_list)

        if type(thing) == type(""):
            thing = unicode(thing)

        try:
            assert type(thing) == type(schema['_type']) or (type(
                thing) == type(u"") and type(schema['_type']) == type(""))
        except AssertionError:
            errors.append(ValidationError(
                "Type mismatch", thing, schema, ancestor_list))
            return errors

        if type(thing) == type([]):
            if '_each' not in schema:
                pass
            else:
                for idx, minithing in enumerate(thing):
                    ancestor_list.append(idx)
                    errors.extend(cls.validate_dict(
                        minithing, schema['_each'], ancestor_list))
                    ancestor_list.pop()

        elif type(thing) == type({}):

            if '_mapping' not in schema:
                return errors

            for key in schema['_mapping']:
                if key not in thing and '_default' in schema['_mapping'][key]:
                    thing[key] = deepcopy(schema['_mapping'][key]['_default'])
                if key not in thing:
                    errors.append(ValidationError(
                        "Key not found: %r" % key, thing, schema, ancestor_list))
                else:
                    ancestor_list.append(key)
                    errors.extend(cls.validate_dict(thing[
                                  key], schema['_mapping'][key], ancestor_list))
                    ancestor_list.pop()

        elif type(thing) == type("") or type(thing) == type(u""):
            if "_minlength" in schema:
                if not (len(thing) >= schema["_minlength"]):
                    errors.append(ValidationError(
                        'String was shorter than _minlength', thing, schema, ancestor_list))
            if "_maxlength" in schema:
                if not (len(thing) <= schema["_maxlength"]):
                    errors.append(ValidationError(
                        'String was longer than _maxlength', thing, schema, ancestor_list))

        elif type(thing) in [int, float]:
            if "_min" in schema:
                if not (thing >= schema["_min"]):
                    errors.append(ValidationError(
                        'int/float was less than min', thing, schema, ancestor_list))
            if "_max" in schema:
                if not (thing <= schema["_max"]):
                    errors.append(ValidationError(
                        'int/float was greater than max', thing, schema, ancestor_list))

        elif type(thing) == type(True):
            pass

        elif thing is None:
            try:
                assert(schema['_type'] is None)
            except Exception:
                raise Exception("thing was null but wasn't supposed to be.\n\n\nschema:{}".format(
                    repr(thing), schema))
            else:
                return errors

        else:
            raise Exception("type not recognized: {}".format(thing))

        return errors

    def _parent(self, levels_up=1):
        path_string = self._path
        parent_path_string = '/'.join(path_string.split('/')[:(0-levels_up)])
        return self.app.find(parent_path_string)

    class FindFailed(Exception):
        pass
    def find(self, path_string, name_allowed=False):
        """If name_allowed is true, then it will try to search an array by name first,
           then resorting to search by index if name doesn't work"""
        if len(path_string) == 0:
            return self

        path = path_string.split('/')
        this_obj = self
        for attr in path:
            # list, dict, or object
            if type(this_obj) == list:

                if name_allowed:
                    try:
                        name_matches = [i for i in this_obj if i.name == attr]
                    except AttributeError:
                        name_matches = [i for i in this_obj if i['name'] == attr]

                    if len(name_matches) == 1:
                        this_obj = name_matches[0]
                        continue
                    elif len(name_matches) > 1:
                        raise Exception(
                            "Name not unique while searching for %r" % path_string)
                    else:
                        pass

                try:
                    attr = int(attr)
                except Exception:
                    if not name_allowed:
                        raise Exception(
                            "Couldn't convert %r to an int. Maybe you meant to use name_allowed=True" % attr)
                    else:
                        raise self.__class__.FindFailed(
                                "Couldn't find thing with name=%r. Path: %r" % (attr, path))

                this_obj = this_obj[attr]

            elif type(this_obj) == dict:
                this_obj = this_obj[attr]

            elif isinstance(this_obj, DictInited):
                this_obj = getattr(this_obj, attr)
            else:
                raise Exception("reached end of path")
        return this_obj

    def set_by_path(self, path_string, value):
        given_path = path_string.split('/')
        assert len(given_path) > 0, "Can't call set on empty path"
        path, attr_to_set = given_path[:-1], given_path[-1]
        obj = self.find('/'.join(path), name_allowed=True)
        if type(obj) == list:
            attr_to_set = int(attr_to_set)
            obj[attr_to_set] = value
        elif type(obj) == dict:
            obj[attr_to_set] = value
        else:
            # the object should be a subclass of dictinited since that's how
            # all this is inited
            assert isinstance(obj, DictInited), "Well this is unexpected"
            setattr(obj, attr_to_set, value)

    def iternodes(self):
        thing = self
        node_stack = [(attr, getattr(self, attr))
                      for attr in self.__class__._schema.keys()]

        while len(node_stack) > 0:
            path, obj = node_stack.pop()
            if type(obj) == dict:
                node_stack.extend([(path + '/' + k, v)
                                  for k, v in obj.iteritems()])
            elif type(obj) == list:
                node_stack.extend([(path + '/' + unicode(i), v)
                                  for i, v in enumerate(obj)])
            elif isinstance(obj, DictInited):
                node_stack.extend([(path + '/' + attr, getattr(obj, attr))
                                  for attr in obj.__class__._schema.keys()])

            yield (path, obj)

    def search(self, regex_string):
        return filter(lambda s: re.search(regex_string, s[0]), self.iternodes())
