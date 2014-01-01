"DataLang parsing and intermediate representation"
from dict_inited import DictInited

class DataLang(object):
    def __init__(self, context_type, seed_entity, field_entity_accesstype_pairs, result_type):
        """
        context_type is Page, Loop, or _____
        field_list is a list of the fields which will be tacked on after seed
        """
        assert context_type in ['Page', 'Loop', 'Form', 'user']
        self.context_type = context_type
        self.seed_entity = seed_entity
        self.field_entity_accesstype_pairs = field_entity_accesstype_pairs
        self.fields = [f for f, e, a in field_entity_accesstype_pairs]
        self.result_type = result_type

    def final_type(self):
        """Returns type of result.
        If primval, returns ('primval', text|number|date...)
        If object, returns ('object', <entity>)
        If collection, returns ('collection', <entity>)
        """
        if len(self.fields) == 0:
            return ('object', self.seed_entity)
        last_field = self.fields[-1]
        # if the last field is not relational, this is a primitiva value of a very simple type
        if not last_field.is_relational():
            assert self.result_type == 'primval'
            return (self.result_type, last_field.type)
        # now we know it's a relational field, so the last field_entity pair should have an entity in it.
        return (self.result_type, self.field_entity_accesstype_pairs[-1][1])

    def to_code(self, context=None, seed_id=None, template=False):
        if self.context_type == 'Form':
            seed_id = seed_id
        elif self.context_type == 'user':
            seed_id = 'request.user'
        else:
            if self.context_type == 'Loop':
                seed_id = 'obj'
            else:
                # this must be page i think. so pass in the pc namespace if you want to get the page context variables
                seed_id = context.get_by_ref(self.seed_entity._django_model)

        def get_accessor(field, entity, access_type):
            "This is separate function so we can have custom logic to handle users (get profile stuff)"
            if access_type == 'direct':
                acc = field._django_field_identifier
            elif access_type == 'related':
                acc = field._django_field.rel_name_id
            else:
                assert False

            return acc
        # i needed the entity of the value being accessed from previously, so i made a list and zipped it with the fields. all in one line cuz i'm lazy
        return ''.join([unicode(seed_id)] + ['.%s' % get_accessor(f, eold, a) for (f, e, a), eold in zip(self.field_entity_accesstype_pairs, [self.seed_entity] + [e for f, e, a in self.field_entity_accesstype_pairs])])


def datalang_to_fields(starting_ent, tokens):
    field_entity_accesstype_tuples = []
    current_ent = starting_ent
    obj_type = 'object'
    for idx, tok in enumerate(tokens):
        last_item_in_loop = (idx == len(tokens) - 1)

        field_candidates = [ f for f in current_ent.fields if f.name == tok ]
        assert len(field_candidates) <= 1, "Found more than one field with the name: %r" % tok
        # try to get the field with this name on this entity
        try:
            access_type = 'direct'
            f = field_candidates[0]
            if f.is_relational():
                current_ent = f.entity
                field_entity_accesstype_tuples.append((f, current_ent, access_type))
                if last_item_in_loop:
                    obj_type = 'object'
            else:
                assert last_item_in_loop, "You can't chain things on after a primval"
                field_entity_accesstype_tuples.append((f, None, access_type))
                obj_type = 'primval'
        # try to get the field with this related_name on this entity
        except IndexError:
            # it couldn't find a field with this name, so let's try to find a related name.
            field_candidates = [ f for path, f in current_ent.app.search(r'^tables/\d+/fields/\d+$') if f.is_relational() and f.related_name == tok and f.entity == current_ent]
            assert len(field_candidates) <= 1, "Found more than one field with the related name: %r and the entity: %r" % (tok, current_ent.name)
            try:
                access_type = 'related'
                f = field_candidates[0]
                current_ent = f._parent(levels_up=2)
                field_entity_accesstype_tuples.append((f, current_ent, access_type))
                if f.type == 'fk':
                    assert last_item_in_loop, "You can't chain things on after collection"
                    obj_type = 'collection'
                else:
                    assert f.type == 'o2o', "Many to many is not yet supported"
                    if last_item_in_loop:
                        obj_type = 'object'
            except IndexError:
		        raise DictInited.FindFailed(
                                "Couldn't find thing with name or related name name=%r" % (tok,))

    return (field_entity_accesstype_tuples, obj_type)

def parse_to_datalang(datalang_string, app):
    tokens = datalang_string.split('.')
    # 1. get the seed type to start the chaining in step 2
    if tokens[0] == 'CurrentUser' or tokens[0] in [u.name for u in app.users]:
        if tokens[0] != 'CurrentUser':
            # TODO security check to make sure that the user role actually has that fields
            pass
        context_type = 'user'
        ent = filter(lambda e: e.is_user, app.tables)[0]
        tokens = tokens[1:]

    elif tokens[0] in ['Page', 'loop', 'Form']:
        upper_first_char = lambda x: x[0].upper() + x[1:].lower()
        context_type = upper_first_char(tokens[0])
        ent = app.tables[0].app.find('tables/%s' % tokens[1], name_allowed=True)
        tokens = tokens[2:]

    else:
        raise Exception("Not Yet Implemented: %r" % tokens[0])

    # 2. get the list of fields by performing entity-field-entity chaining
    field_entity_accesstype_pairs, result_type = datalang_to_fields(ent, tokens)
    # 3. create a datalang instance and bind it to dest_attr
    dl = DataLang(context_type, ent, field_entity_accesstype_pairs, result_type)
    return dl


