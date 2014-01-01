CANON_TYPE_MAP = {'text': 'TextField',
                 'link': 'URLField',
                 'number': 'FloatField',
                 'date': 'DateTimeField',
                 '_CREATED': 'DateTimeField',
                 '_MODIFIED': 'DateTimeField',
                 'email': 'EmailField',
                 'image': 'TextField',
                 'file': 'TextField',
                 'money': 'FloatField'
                 }

class_namespace_keywords = ('__new__', '__init__', '__del__', '__repr__', '__str__', '__lt__', '__cmp__', '__rcmp__', '__hash__', '__nonzero__', '__unicode__', '__getattr__', '__setattr__', '__delattr__', '__getattribute__', '__get__', '__set__', '__delete__', '__slots__', '__metaclass__', '__instancecheck__', '__subclasscheck__', '__call__', '__len__', '__getitem__', '__setitem__', '__delitem__', '__iter__', '__reversed__', '__contains__', '__getslice__', '__setslice__', '__delslice__', '__add__', '__div__', '__radd__', '__iadd__', '__neg__', '__complex__', '__oct__', '__index__', '__coerce__', '__enter__', '__exit__')

class RoleRedirectChunk(object):
    def __init__(self, role_codechunk_tuples, role_field_id):
        "role_codechunk_tuples maps the role to the code which will evaluate to the URL of the redirect"
        self.role_codechunk_tuples = role_codechunk_tuples
        self.role_field_id = role_field_id

    def render(self, ajax=True):
        if len(self.role_codechunk_tuples) == 0:
            assert False, "wtf, empty map?"

        if ajax:
            code_for_redirect = lambda x: "JsonResponse(data={'redirect_to': %s})" % x
        else:
            code_for_redirect = lambda x: "redirect(%s)" % x

        if len(self.role_codechunk_tuples) == 1:
            return "return %s" % code_for_redirect(self.role_codechunk_tuples[0][1])

        # if x redirect to y, [elif x redirect to y]*, else assert false structure
        accum = ""
        accum += "\nif request.user.%s == '%s':\n    return %s" % (self.role_field_id, self.role_codechunk_tuples[0][0], code_for_redirect(self.role_codechunk_tuples[0][1]))
        for tup in self.role_codechunk_tuples[1:]:
            accum += "\nelif request.user.%s == '%s':\n    return %s" % (self.role_field_id, tup[0], code_for_redirect(tup[1]))
        accum += "\nelse:\n    assert False, 'Role can\\'t have value %r' % request.user." + str(self.role_field_id,) # inconvenient to use a format string here
        return accum


class FnCodeChunk(object):
    # wrapper around function which makes the str() method call the function with no args

    def __init__(self, fn):
        self.fn = fn

    def __str__(s):
        return s.fn()

    def __call__(s):
        return s.fn()

    def render(s, **kwargs):
        return str(s)

class EmailStatement(object):
    """ A wrapper class for an email method """

    def __init__(self, email_tuple):
        self.from_email, self.to_email, self.subject, self.text, self.email_template = email_tuple
        self.to_str = str(email_tuple)

    def __str__(self):
        return self.render()

    def tuple_str(self):
        return self.to_str

    def render(self):
        #TODO: Get rid of harcoded request!
        return 'send_template_email(%r, %s, %r, %r, %r, request)' % (self.from_email, self.to_email, self.subject, self.text, self.email_template.filename)

class AssignStatement(object):
    # a simple helper for x = y statements

    def __init__(self, left_side, right_side):
        self.left_side, self.right_side = (left_side, right_side)

    def __str__(s):
        return s.render()

    def render(self):
        return "%s = %s" % (self.left_side, self.right_side)

from . import env

class AnonymousCode(object):
    """
    A trivial example:

    class SettingsCode(AnonymousCode):
        template_name = "settings.py.template"

        def add_fb(self, fb1, fb2):
            self.locals['FB_KEY'] = repr(fb1)
            self.locals['FB_SEC'] = fb2

    sc = SettingsCode(settings_namespace)
    sc.add_fb("abc", "123")
    sc.render()
    """

    template_name = "something.html"

    def __init__(self, namespace):
        self.namespace = namespace
        self.locals = {}

    def render(self):
        return env.get_template(self.__class__.template_name).render(locals=self.locals, imports=self.namespace.imports())
