import re
import keyword

built_in_functions = ('abs', 'divmod', 'input', 'open', 'staticmethod',
                      'all', 'enumerate', 'int', 'ord', 'str',
                      'any', 'eval', 'isinstance', 'pow', 'sum',
                      'basestring', 'execfile', 'issubclass', 'print', 'super',
                      'bin', 'file', 'iter', 'property', 'tuple',
                      'bool', 'filter', 'len', 'range', 'type',
                      'bytearray', 'float', 'list', 'raw_input', 'unichr',
                      'callable', 'format', 'locals', 'reduce', 'unicode',
                      'chr', 'frozenset', 'long', 'reload', 'vars',
                      'classmethod', 'getattr', 'map', 'repr', 'xrange',
                      'cmp', 'globals', 'max', 'reversed', 'zip',
                      'compile', 'hasattr', 'memoryview', 'round', '__import__',
                      'complex', 'hash', 'min', 'set', 'apply',
                      'delattr', 'help', 'next', 'setattr', 'buffer',
                      'dict', 'hex', 'object', 'slice', 'coerce',
                      'dir', 'id', 'oct', 'sorted', 'intern')

django_keywords = ('',)


def cw2us(x):  # capwords to underscore notation
    return re.sub(r'(?<=[a-z])[A-Z]|(?<!^)[A-Z](?=[a-z])',
                  r"_\g<0>", x).lower()


def us2mc(x):  # underscore to mixed case notation
    return re.sub(r'_([a-z])', lambda m: (m.group(1).upper()), x)


def us2cw(x):  # underscore to capwords notation
    s = us2mc(x)
    return s[0].upper() + s[1:]


def make_safe(s):
    s = s.replace(' ', '_')
    s = re.sub(r'[^a-zA-Z0-9_]', '', s)
    s = re.sub(r'^[^a-zA-Z]+', '', s)
    if len(s) == 0:
        print "this is bad"
        return 'unnamed'
    if not re.search(r'^[a-zA-Z]', s):
        s = {1: 'one', 2: 'two', 3: 'three',
             4: 'four', 5: 'five', 6: 'six',
             7: 'seven', 8: 'eight', 9: 'nine',
             0: 'zero'}[s[0]] + s[1:]
    if (s in built_in_functions) or keyword.iskeyword(s):
        s += '_val'
    if s.endswith('_'):
        s = s + "val"
    return s


class Identifier(object):

    def __str__(self):
        return self.identifier

    def __unicode__(self):
        return self.identifier

    def __eq__(self, other):
        if isinstance(other, basestring):
            return self.identifier == other
        else:
            return NotImplemented

    def __init__(self, identifier, ns, ref=None, is_import=False):
        """Identifier represents the identifier string, the namespace it's in,
            , and optionally: a reference to "the truth" and the import symbol."""
        self.identifier = identifier
        self.ref = ref
        self.ns = ns  # this is a namespace
        self.is_import = is_import

    def fix_identifier(self):
        self.identifier = self.ns.make_name_safe_and_unique(self.identifier)


class Namespace(object):

    def __init__(self, identifiers=None, parent_namespace=None, child_namespaces=None):
        self.identifiers = [] if identifiers is None else identifiers
        self.parent_namespace = parent_namespace
        self.child_namespaces = []
        if self.parent_namespace is not None:
            self.parent_namespace.add_child_namespace(self)

        if child_namespaces is not None:
            for c_n in child_namespaces:
                self.add_child_namespace(c_n)

        # self.assert_identifiers_safe_and_unique() # safe = they are valid
        # names and they don't override a builtin

    def add_child_namespace(self, c_n):
        c_n.parent_namespace = self
        self.child_namespaces.append(c_n)
        self.fix_children()

    def fix_children(self):
        for i in self.child_identifiers():
            """for x in self.used_ids():
                if i.identifier == x.identifier:
                    """
            if i in self.used_ids():
                i.fix_identifier()
                i.ns.fix_children()

    def used_ids(self):
        """
        Yields this namespaces identifiers first,
           then the parents', inductively
        """
        for i in self.identifiers:
            yield i
        if self.parent_namespace is not None:
            for i in self.parent_namespace.used_ids():
                yield i

    def child_identifiers(self):
        """
        Useful for fixing the identifiers of the children
        """
        for c_n in self.child_namespaces:
            for i in c_n.identifiers:
                yield i
            for i in c_n.child_identifiers():
                yield i

    def new_identifier(self, name, ref=None, cap_words=False, ignore_case=False, is_import=False):
        candidate = name
        if cap_words:
            candidate = us2cw(candidate)
        else:
            if not ignore_case:
                candidate = unicode(candidate).lower()
        candidate = self.make_name_safe_and_unique(candidate)
        new_ident = Identifier(candidate, self, ref=ref, is_import=is_import)
        self.identifiers.append(new_ident)
        return new_ident

    def make_name_safe_and_unique(self, name):
        name = unicode(name)
        candidate = make_safe(name)

        while candidate in (i.identifier for i in self.used_ids()):
            # exit condition: candidate is not a used identifier
            if re.search(r'[2-9]$', candidate):
                candidate = candidate[:-1] + str(int(candidate[-1]) + 1)
            else:
                candidate += '2'
        return candidate

    def get_by_ref(self, ref):
        assert ref is not None
        for i in self.used_ids():
            if i.ref == ref:
                return i
        assert False, "Thing with this ref not found: %r" % (ref, )

    def get_by_import(self, import_symbol):
        assert import_symbol is not None
        for i in self.used_ids():
            if i.ref == import_symbol:
                return i
        assert False, "Thing with this import not found: %r" % (import_symbol,)

    def find_or_create_identifier(self, ref, proposed_id, **kwargs):
        try:
            return self.get_by_ref(ref)
        except AssertionError:
            return self.new_identifier(proposed_id, ref=ref, **kwargs)

    def find_or_create_import(self, import_symbol, proposed_id, **kwargs):
        try:
            return self.get_by_ref(import_symbol)
        except AssertionError:
            return self.new_identifier(proposed_id, ref=import_symbol, is_import=True, ignore_case=True, **kwargs)

    # the dictionary produced is a symbol -> identifier map.
    # symbol meaning the unique internal name used to refer to the import
    def imports(self):
        imports = { i.ref: i for i in self.used_ids() if i.is_import }
        return imports
