import os
import types
import re
import logging

from django.template import Template, TemplateDoesNotExist
from django.conf import settings

MODULES_PACKAGE = 'forum_modules'

MODULES_FOLDER = os.path.join(os.path.dirname(__file__), '../../' + MODULES_PACKAGE)

DISABLED_MODULES = getattr(settings, 'DISABLED_MODULES', [])

MODULE_LIST = filter(lambda m: getattr(m, 'CAN_USE', True), [
        __import__('forum_modules.%s' % f, globals(), locals(), ['forum_modules'])
        for f in os.listdir(MODULES_FOLDER)
        if os.path.isdir(os.path.join(MODULES_FOLDER, f)) and
           os.path.exists(os.path.join(MODULES_FOLDER, "%s/__init__.py" % f)) and
           not f in DISABLED_MODULES
])

def get_modules_script(script_name):
    all = []

    for m in MODULE_LIST:
        try:
            all.append(__import__('%s.%s' % (m.__name__, script_name), globals(), locals(), [m.__name__]))
        except ImportError, e:
            #print repr(type(e)) + m.__name__ + ":" + str(e)
            pass
        except:
            import traceback
            msg = "Error importing %s from module %s: \n %s" % (
                script_name, m.__name__, traceback.format_exc()
            )
            logging.error(msg)

    return all

def get_modules_script_implementations(script_name, impl_class):
    scripts = get_modules_script(script_name)
    all_impls = {}

    for script in scripts:
        all_impls.update(dict([
            (n, i) for (n, i) in [(n, getattr(script, n)) for n in dir(script)]
            if isinstance(i, impl_class)
        ]))

    return all_impls

def get_modules_script_classes(script_name, base_class):
    scripts = get_modules_script(script_name)
    all_classes = {}

    for script in scripts:
        all_classes.update(dict([
            (n, c) for (n, c) in [(n, getattr(script, n)) for n in dir(script)]
            if isinstance(c, (type, types.ClassType)) and issubclass(c, base_class)
        ]))

    return all_classes

def get_all_handlers(name):
     handler_files = get_modules_script('handlers')

     return [
        h for h in [
            getattr(f, name) for f in handler_files
            if hasattr(f, name)
        ]

        if callable(h)
     ]

def call_all_handlers(name, *args, **kwargs):
    all = get_all_handlers(name)

    ret = []

    for handler in all:
        ret.append(handler(*args, **kwargs))

    return ret

def get_handler(name, default):
    all = get_all_handlers(name)
    return len(all) and all[0] or default

module_template_re = re.compile('^modules\/(\w+)\/(.*)$')

def module_templates_loader(name, dirs=None):
    result = module_template_re.search(name)

    if result is not None:
        file_name = os.path.join(MODULES_FOLDER, result.group(1), 'templates', result.group(2))

        if os.path.exists(file_name):
            try:
                f = open(file_name, 'r')
                source = f.read()
                f.close()
                return (source, file_name)
            except:
                pass

    raise TemplateDoesNotExist, name 

module_templates_loader.is_usable = True

from decorators import decorate, ReturnImediatelyException
