from app_builder import naming

from . import env
import utils


class DjangoForm(object):

    def __init__(self, identifier, model_id, field_ids, required_field_id_types=None):
        """
        For now it'll only work with model fields
        """
        self.identifier = identifier
        self.is_signup = False
        self.namespace = naming.Namespace(parent_namespace=identifier.ns)
        self.model_id = model_id
        self.code_path = 'webapp/forms.py'
        self.field_ids = field_ids
        self.required_field_id_types = [] if required_field_id_types is None else required_field_id_types
        # convert the type to django type
        self.required_field_id_types = [ (a, utils.CANON_TYPE_MAP[b].replace("TextField", "CharField")) for a, b in self.required_field_id_types]
        # now this has the identifier of the field, and the django type.

    def render(self):
        if len(self.field_ids) == 1:
            self.included_field_string = repr(str(self.field_ids[0])) + ','
        else:
            self.included_field_string = ', '.join([repr(str(i)) for i in self.field_ids])
        return env.get_template('form.py.template').render(form=self, imports=self.namespace.imports(), locals={})


class DjangoLoginForm(DjangoForm):

    def __init__(self, identifier):
        self.identifier = identifier
        self.is_signup = False
        self.namespace = naming.Namespace(parent_namespace=identifier.ns) # this is necessary so the coder can get imports from the namespace
        self.code_path = 'webapp/forms.py'

    def render(self):
        return ""

class DjangoSignupForm(DjangoForm):

    def __init__(self, identifier, model_id):
        self.identifier = identifier
        self.is_signup = True
        self.namespace = naming.Namespace(parent_namespace=identifier.ns) # this is necessary so the coder can get imports from the namespace
        self.model_id = model_id
        self.code_path = 'webapp/forms.py'

    def render(self):
        self.included_field_string = "'email',"
        return env.get_template('form_signup.py.template').render(form=self, imports=self.namespace.imports(), locals={})

class DjangoAdminUserCreationForm(DjangoForm):
    """
    This is the django admin sign up form object, which is a wrapper around the original one.
    required because django admin object expects the interface to match up w the django.contrib.auth one
    """

    def __init__(self, identifier, original_sform_id):
        self.identifier = identifier
        self.namespace = naming.Namespace(parent_namespace=identifier.ns) # this is necessary so the coder can get imports from the namespace
        self.code_path = 'webapp/admin.py'
        self.super_class_id = original_sform_id

    def render(self):
        return env.get_template('form_signup_admin.py.template').render(form=self, imports=self.namespace.imports(), locals={})
