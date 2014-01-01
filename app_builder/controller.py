from coder import Coder
from create_functions import AppComponentFactory, SettingsFactory
from pyflakes.api import check

import logging
import traceback

logger = logging.getLogger('app_builder.controller')

def create_codes(app, uid=None, email=None, provider_data=None):
    uid = uid or "random"
    email = email or "team@appcubator.com"

    DEFAULT_PROVIDER_DATA = {
          "FACEBOOK": {
                        "FACEBOOK_APP_ID": '145000778994158',
                        "FACEBOOK_API_SECRET": 'f5f3f2a69011b36da2005fbea8aa3476'
                        },
          "TWITTER": {
                        "TWITTER_CONSUMER_KEY": '4XzJvQ1nZTMVcVmPwBjw',
                        "TWITTER_CONSUMER_SECRET": 'YejAm6MhKfwh2YhqcG4Ljf0Hakgsnp5HzfyBA7bJBDk'
                        },
          "LINKEDIN": {
                        "LINKEDIN_CONSUMER_KEY": 't0q97cjtk5kf',
                        "LINKEDIN_CONSUMER_SECRET": '1R8SdQPxL9rzAlvD'
                        }
          }

    if provider_data is not None:
        DEFAULT_PROVIDER_DATA.update(provider_data)

    factory = AppComponentFactory()
    settings = SettingsFactory(uid, email, DEFAULT_PROVIDER_DATA)

    create_map = {# MODELS
                  'setup user roles namespace': factory.setup_userrole_namespace,
                  'create model for entity': factory.create_model,
                  'create relational fields for entity': factory.create_relational_fields_for_model,

                  'import model into admin': lambda entity: factory.import_model_into_namespace(entity, 'admin'),
                  #'import model ie resource into admin': factory.import_model_ie_resource_into_admin,

                  'import model into views': lambda entity: factory.import_model_into_namespace(entity, 'views'),
                  'import model into forms': lambda entity: factory.import_model_into_namespace(entity, 'forms'),
                  'import model into form receivers': lambda entity: factory.import_model_into_namespace(entity, 'form receivers'),
                  'import model into tests': lambda entity: factory.import_model_into_namespace(entity, 'tests'),

                  'create import export resource': factory.create_import_export_resource,
                  'import model ie resource into admin': factory.import_model_ie_resource_into_admin,
                  'create import export admin model': factory.create_import_export_admin_model,
                  'register admin model with admin site': factory.register_model_with_admin,

                  # INITING FOR URLS
                  'create urls object for app': factory.create_urls,
                  'create urls object for app form receivers': factory.create_fr_urls,
                  'create misc urls object for app': factory.create_misc_urls,
                  'add social include url': factory.add_social_include_url,
                  "create url for socialauth login handler if not created": factory.create_url_for_socialauth_login_handler_if_not_created,
                  'add logout url': factory.add_logout_url,
                  'add search url' : factory.add_search_url,
                  'add admin urls' : factory.add_admin_urls,
                  'static serve': factory.add_static_serve,

                  # GET REQUEST HANDLERS
                  'view for page': factory.create_view_for_page,
                  'url to serve page': factory.add_page_to_urls,
                  'find or add the needed data to the view': factory.find_or_create_query_for_view ,
                  'find or add the needed search to the view': factory.find_or_create_search_for_view ,
                  'create socialauth login handler': factory.create_socialauth_login_handler_if_not_exists,

                  # PAGE AND DATALANG
                  'resolve links href' : factory.resolve_page_and_its_datalang,

                  # Emails
                  'make emailer' : factory.create_emailer,

                  # Search
                  'search code generation' : factory.add_search_functionality,

                  # HTML GEN STUFF
                  'translate strings in uielements': factory.properly_name_variables_in_template,
                  'create row/col structure for nodes': factory.create_tree_structure_for_page_nodes,
                  'create tests for static pages': factory.create_tests_for_static_pages,
                  'generate base.html': factory.create_base_html,
                  'generate settings.py': settings.create_settings,

                  # ENTITY FORM RELATED HOOKS
                  'create form object': factory.create_django_form_for_entity_based_form,
                  'create form receiver': factory.create_form_receiver_for_form_object,
                  'create url for form receiver': factory.create_url_for_form_receiver,
                  'import form into form receivers': factory.import_form_into_form_receivers,
                  # I put this in import form into the create url step 'set post url for form': factory.set_post_url_for_form,
                  'add the relation things to the form recevier': factory.add_relation_assignments_to_form_receiver,
                  'add email actions to the form receiver': factory.add_email_actions_to_form_receiver,

                  # USER FORM RELATED HOOKS
                  'create login form if not exists': factory.create_login_form_if_not_exists,
                  'create signup form if not exists': factory.create_signup_form_if_not_exists,
                  'create login form receiver if not exists': factory.create_login_form_receiver_if_not_created,
                  'create signup form receiver if not exists': factory.create_signup_form_receiver_if_not_created,
                  'create url for form receiver if not created': factory.create_url_for_form_receiver_if_not_created,
                  'add emails for non general form receivers': factory.add_email_actions_to_non_general_form_receiver,

                  # AWKWARD CUSTOM USERMODEL ADMIN WORKAROUND
                  "create admin create user form": factory.create_admin_create_user_form,
                  "create useradmin": factory.create_useradmin,

                  # PLUGINS
                  "require plugin data": settings.require_data,
    }


    codes = []

    def create(event_name, el, *args, **kwargs):
        try:
            logger.info("Running hook: %s" % event_name)
            c = create_map[event_name](el)
        except KeyError:
            raise
        else:
            if c is not None:
              if isinstance(c, list):
                for cc in c:
                  codes.append(cc)
              else:
                codes.append(c)

    # setup models
    # XXX This is critical. some of the tables are just user roles, but only the combined user entity is relevant.
    relevant_tables = [t for t in app.tables if not t.is_user] + [app.userentity]
    for ent in relevant_tables:
        create('create model for entity', ent) # only creates primitive fields
    for ent in app.tables:
        if ent not in relevant_tables:
            ent._django_model = app.userentity._django_model
    for ent in relevant_tables: # doing relational fields after because all models need to be created for relations to work
        create('create relational fields for entity', ent)

        create('import model into views', ent)
        create('import model into forms', ent)
        create('import model into form receivers', ent)
        create('import model into tests', ent)
        create('import model into admin', ent)

        # import/export for the models
        create('create import export resource', ent)
        create('import model ie resource into admin', ent)
        create('create import export admin model', ent)
        if ent is not app.userentity: # for user entity, delay to end, because of some form/user admin stuff...
            create('register admin model with admin site', ent)

    create('setup user roles namespace', app)

    # routes and functions to serve pages
    create('create urls object for app', app)
    create('create urls object for app form receivers', app)
    create('create misc urls object for app', app)
    create('add social include url', app)
    create('add admin urls', app)
    create('add logout url', app)
    for p in app.pages:
        create('view for page', p)
        create('url to serve page', p)

    # UIELEMENT HOOKS
    for p in app.pages:
        for uie in p.uielements:
            for hook_name in uie.hooks:
                try:
                    create(hook_name, uie)
                except Exception, e:
                    logger.error("Failed to call hook %r on %r instance" % (hook_name, uie.__class__.__name__))
                    traceback.print_exc()
                    raise
            try:
                row_uielements = uie.container_info.row.uielements
            except AttributeError:
                pass
            else:
                for r_uie in row_uielements:
                    for hook_name in r_uie.hooks:
                        try:
                            create(hook_name, r_uie)
                        except Exception, e:
                            logger.error("Failed to call hook %r on %r instance" % (hook_name, r_uie.__class__.__name__))
                            traceback.print_exc()
                            raise

    # Emailer
    create('make emailer', app)

    # translation of {{ page.book.name }} to proper django template code
    for p in app.pages:
        create('translate strings in uielements', p)

    # create html nodes and structure for pages
    for p in app.pages:
        create('create row/col structure for nodes', p)

    # create('search rendering', app.pages[len(app.pages)-1])

    # random app-wide stuff
    create("create admin create user form", app),
    create("create useradmin", app),
    create('register admin model with admin site', app.userentity)
    create('create tests for static pages', app)
    create('generate base.html', app)
    create('static serve', app)

    create('generate settings.py', None)

    return codes

def main(app):
    codes = create_codes(app)
    cc = Coder.create_from_codes(codes)

    for rel_path, code in cc.itercode():
        print "\n\n============ %s ============\n" % rel_path, code
        #if rel_path.endswith('.py'):
        #    print check(code, 'test.py')
    return (codes, cc)


"""
Sample actions include-
    render some page with some data
    redirect to another page with some data
    get noun from the DB with some query
    create, update, or delete some noun
    send an email to some user with some data

Result should be similar to an AST.
    actions=
    [
"""
