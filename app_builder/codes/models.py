from app_builder import naming
from datetime import datetime

from . import env
import utils

model_namespace_keywords = utils.class_namespace_keywords + ("clean", "clean_fields", "validate_unique", "save", "pk", "delete", "__unicode__", "__str__", "get_absolute_url", "permalink", "objects")
user_model_namespace_keywords = ("username", "email", "first_name", "last_name", "password", "groups", "is_staff", "is_active", "is_superuser", "last_login", "date_joined", "get_username", "is_anonymous", "is_authenticated", "get_full_name", "set_password", "check_password", "set_unusable_password", "has_usable_password", "get_group_permissions", "get_all_permissions", "has_perm", "has_perms", "has_module_perms", "email_user", "get_profile")

def block_namespace(namespace, list_of_ids):
    "Blocks a namespace with a list of ids"
    for i in list_of_ids:
        namespace.new_identifier(i, ref=('BLOCKED', i))
    return namespace


class SearchQuery(object):

    def __init__(self, model_id, sort_by_id=None, limit=-1):
        self.model_id = model_id
        # TODO implement these
        self.sort_by_id = sort_by_id
        self.limit = limit

    def render(self):
        code_line = "search_%s" % self.model_id.__str__().lower()

        if self.limit is not -1:
            code_line += "[:%d]" % self.limit
        return code_line



class DjangoQuery(object):

    def __init__(self, model_id, where_data=None, sort_by_id=None, limit=None, exclude_admin=False):
        self.model_id = model_id
        self.where_data = where_data if where_data is not None else []
        # TODO implement these
        self.sort_by_id = sort_by_id
        self.limit = limit
        self.exclude_admin = exclude_admin

    def render(self):
        if self.exclude_admin:
            code_line = "%s.objects.exclude(username='admin')" % self.model_id
        else:
            code_line = "%s.objects.all()" % self.model_id

        if len(self.where_data) != 0:
            code_line += '.filter(' + ', '.join(["%s=%s" % (a, b) for a, b in self.where_data]) + ')'
        # Natural enumeration 
        if self.sort_by_id is not None:
            code_line += ".order_by('%s')" % self.sort_by_id
        if self.limit is not -1:
            code_line += "[:%d]" % self.limit
        return code_line


class DjangoField(object):

    _type_map = utils.CANON_TYPE_MAP

    def __init__(self, identifier, canonical_type, required=False, parent_model=None):
        """parent_model is a DjangoModel instance"""
        self.identifier = identifier
        self.canon_type = canonical_type
        self.django_type = self.__class__._type_map[canonical_type]
        self.required = required
        self.model = parent_model
        self.args = []

    def kwargs(field):
        kwargs = {}
        if field.canon_type == '_CREATED':
            kwargs['auto_now_add'] = True
        elif field.canon_type == '_MODIFIED':
            kwargs['auto_now'] = True
        if field.required:
            if field.canon_type in ['text', 'email', 'image', 'file', 'link']:
                kwargs['default'] = repr("")
            # Date time defaults should be skipped now.
            # if field.canon_type in ['date', '_CREATED', '_MODIFIED']:
            #     kwargs['default'] = datetime.now
            elif field.canon_type in ['number', 'money']:
                kwargs['default'] = 0
        else:
            kwargs['blank'] = True
            if field.django_type not in ('TextField', 'CharField'):
                kwargs['null'] = True
        return kwargs

class DjangoRelatedField(object):
    """Should abide by the same interface as DjangoField"""
    _type_map = {
        'fk': 'ForeignKey',
        'm2m': 'ManyToManyField',
        'o2o': 'OneToOneField',
    }

    def __init__(self, identifier, relation_type, rel_model_id, rel_name_id, required=True, parent_model=None, quote=True):
        self.identifier = identifier
        self.rel_type = relation_type
        self.django_type = self.__class__._type_map[relation_type]
        self.required = required
        self.model = parent_model
        self.rel_model_id = rel_model_id
        self.rel_name_id = rel_name_id
        if quote:
            self.args = ["'%s'" % str(rel_model_id)]
        else:
            self.args = [str(rel_model_id)]

    def kwargs(field):
        kwargs = {}
        kwargs['related_name'] = repr(str(field.rel_name_id))
        if not field.required:
            kwargs['blank'] = repr(True)
            kwargs['null'] = repr(True)
        return kwargs


class DjangoModel(object):

    def __init__(self, identifier):
        self.identifier = identifier
        identifier.ref = self
        self.code_path = "webapp/models.py"
        self.namespace = naming.Namespace(parent_namespace=self.identifier.ns)
        block_namespace(self.namespace, model_namespace_keywords)
        self.fields = []

    def create_field(self, name, canonical_type, required):
        identifier = self.namespace.new_identifier(name)
        f = DjangoField(
            identifier, canonical_type, required=required, parent_model=self)
        self.fields.append(f)
        return f

    def create_relational_field(self, name, relation_type, rel_model_id, rel_name_id, required, quote=True):
        assert relation_type in ['o2o', 'm2m', 'fk']
        identifier = self.namespace.new_identifier(name)
        f = DjangoRelatedField(
            identifier, relation_type, rel_model_id, rel_name_id, required=required, parent_model=self, quote=quote)
        self.fields.append(f)
        return f

    def add_date_created_field(self, identifier):
        f = DjangoField(identifier, '_CREATED', required=True, parent_model=self)
        self.fields.append(f)
        return f

    def add_date_modified_field(self, identifier):
        f = DjangoField(identifier, '_MODIFIED', required=True, parent_model=self)
        self.fields.append(f)
        return f

    def render(self):
        return env.get_template('model.py.template').render(model=self, imports=self.namespace.imports(), locals={})


class DjangoUserModel(DjangoModel):

    def __init__(self, user_identifier):
        """Provide:
        1. the identifier for the user (imported from django.contrib.models...),

        """
        super(DjangoUserModel, self).__init__(user_identifier)
        block_namespace(self.namespace, user_model_namespace_keywords)
        self.is_user_model = True

    def render(self):
        return env.get_template('usermodel.py.template').render(model=self, imports=self.namespace.imports(), locals={})


class DjangoImportExportResource(object):
    def __init__(self, identifier, model_id):
        self.identifier = identifier
        self.code_path = 'webapp/models.py'
        self.model_identifier = model_id
        self.namespace = naming.Namespace(parent_namespace=self.identifier.ns)
        block_namespace(self.namespace, model_namespace_keywords)

    def render(self):
        return """class {this_id}({resources_id}.ModelResource):

    class Meta:
        model = {model_id}""".format(this_id=self.identifier, model_id=self.model_identifier, resources_id=self.namespace.imports()['utils.import_export.resources'])

class DjangoImportExportAdminModel(object):
    def __init__(self, identifier):
        self.code_path = 'webapp/admin.py'
        self.identifier = identifier
        self.namespace = naming.Namespace(parent_namespace=self.identifier.ns)
        block_namespace(self.namespace, model_namespace_keywords)

    def render(self):
        return """class {this_id}({iem_admin_id}):
    pass
        """.format(this_id=self.identifier, iem_admin_id=self.namespace.imports()['utils.import_export.admin.model_admin'])

class DjangoMyUserAdmin(object):
    """
    This is the django admin sign up form object, which is a wrapper around the original one.
    required because django admin object expects the interface to match up w the django.contrib.auth one
    """

    def __init__(self, identifier, create_form_id):
        self.identifier = identifier
        self.namespace = naming.Namespace(parent_namespace=identifier.ns) # this is necessary so the coder can get imports from the namespace
        self.code_path = 'webapp/admin.py'
        self.super_class_id = create_form_id

    def render(self):
        return env.get_template('admin_myuseradmin.py.template').render(form=self, imports=self.namespace.imports(), locals={})

class AdminRegisterLine(object):
    def __init__(self, parent_namespace, model_identifier, admin_id):
        self.code_path = 'webapp/admin.py'
        self.parent_namespace = parent_namespace
        self.namespace = parent_namespace # to make coder happy
        self.model_identifier = model_identifier
        self.admin_id = admin_id
    def render(self):
        return "%s.site.register(%s, %s)\n" % (self.parent_namespace.imports()['django.admin'], self.model_identifier, self.admin_id)

