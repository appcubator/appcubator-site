import traceback
import os
import os.path
import autopep8
import shutil
import tempfile
import logging
import re

from imports import IMPORTS
from codes import Import


logger = logging.getLogger("app_builder.coder")

from os.path import join

class Coder(object):

    def __init__(self):
        self._codes = {}

    @classmethod
    def create_from_codes(cls, codes):
        self = cls()
        for c in codes:
            self.add_code(c)
        return self

    def add_code(self, code_obj):

        try:
            self._codes[code_obj.code_path].append(code_obj)
        except KeyError:
            self._codes[code_obj.code_path] = [code_obj]

    def itercode(self):
        """Returns a generator like [(relative_path of directory, code_string)...]"""
        for relative_path, codes in self._codes.iteritems():
            code = '\n\n'.join([ c.render() for c in codes ])

            if relative_path.endswith('.py'):
                try:
                    try:
                        # get the base imports
                        imports = codes[0].namespace.imports().items() # tuples (import symbol, identifier to use)
                    except AttributeError:
                        imports = []

                    import_codes = []
                    for import_symbol, identifier in imports:
                        if isinstance(import_symbol, basestring) and import_symbol.startswith('django.'):
                            import_string = IMPORTS[import_symbol]
                            m = re.match(r'from (.*) import (.*)$', import_string)
                            from_string, real_import_name = (m.group(1), m.group(2))
                        elif import_symbol[0].startswith('webapp.'):
                            from_string, real_import_name = import_symbol[0], import_symbol[1]
                        elif import_symbol.startswith('utils.'):
                            # The case where you want to import third party applications/non webapp or django modules
                            import_string = IMPORTS[import_symbol]
                            m = re.match(r'from (.*) import (.*)$', import_string)
                            from_string, real_import_name = (m.group(1), m.group(2))
                        else:
                            print import_symbol
                            raise KeyError
                        i = Import(real_import_name, identifier, from_string=from_string)
                        import_codes.append(i)

                    # looks complicated, but it's just collecting the imports by same from_string,
                    # using sorted to ensure determinism of outputted code, for fast deploy to work.
                    imports_by_from_string = { fs: [i for i in import_codes if i.from_string == fs] for fs in sorted(set([i.from_string for i in import_codes]))}
                    normal_imports = '\n'.join([i.render() for i in sorted(imports_by_from_string.get('',[]))])
                    try:
                        del imports_by_from_string['']
                    except KeyError:
                        pass
                    from_string_imports = '\n'.join(sorted([Import.render_concatted_imports(imps) for imps in imports_by_from_string.values()]))

                    code = normal_imports + '\n\n' + from_string_imports + '\n\n' + code
                    try:
                        compile(code + "\n", relative_path, "exec")
                    except IndentationError:
                        traceback.print_exc()
                        print code
                        continue

                except SyntaxError:
                    traceback.print_exc()
                    print code
                    continue
                else:
                    code = autopep8.fix_string(code)

            yield (relative_path, code)


""" Directory Structure """

"""
./
    requirements.txt

    __init__.py
    manage.py
    wsgi.py
    urls.py

    settings/
        common.py
        dev.py
        prod.py

    webapp/
        __init__.py
        urls.py
        models.py
        admin.py
        pages.py
        forms.py
        form_receivers.py
        emailer.py

        templates/
            base.html
            <template files>

        static/
            reset.css
            bootstrap.css
            style.css
            ajaxify.js
            jslibs/
                backbone.js
                underscore.js
                bootstrap.min.js
"""

def write_to_fs(coder, css="", dest=None):
    logger.info("Writing app to temporary directory.")

    if dest is None:
        logger.debug("Making temporary directory as destination.")
        dest = tempfile.mkdtemp()
        logger.debug("Destination: %s" % dest)

    bpsrc = os.path.join(os.path.dirname(__file__), "code_boilerplate")

    # if dir is not empty, throw an exception
    dest = os.path.normpath(dest)
    if os.listdir(dest):
        raise Exception("I'm not going to write into a nonempty directory, that's dangerous")

    # create directories
    logger.debug("Creating internal directories.")
    if not os.path.exists(dest):
        os.makedirs(dest)
    os.mkdir(join(dest, "webapp"))
    os.mkdir(join(dest, "webapp", "templates"))
    os.mkdir(join(dest, "webapp", "static"))
    #os.mkdir(join(dest, "webapp", "static", "jslibs"))

    def f_transporter(src_str, dest_str, f, *args, **kwargs):
        src_tokens = src_str.split('/')
        dest_tokens = dest_str.split('/')
        return f(join(bpsrc, *src_tokens), join(dest, *dest_tokens), *args, **kwargs)

    def write_string(content, dest_str):
        dest_tokens = dest_str.split('/')
        f = open(join(dest, *dest_tokens), "wb")
        f.write(content.encode("utf-8"))
        f.close()

    def copy_file(src_str, dest_str):
        return f_transporter(src_str, dest_str, shutil.copyfile)

    # copy boilerplate
    logger.debug("Copying boilerplate files.")
    for fname in ['requirements.txt', '__init__.py', 'manage.py', 'wsgi.py', 'README.md', 'README.pdf']:
        copy_file(fname, fname)

    copy_file('Procfile.txt', 'Procfile')
    copy_file('gitignore.gitignore', '.gitignore')
    f_transporter('settings', 'settings', shutil.copytree)
    #copy_file('base.html', 'webapp/templates/base.html') this is dynamic now. see controller.py
    copy_file('500.html', 'webapp/templates/500.html')
    copy_file('404.html', 'webapp/templates/404.html')
    os.makedirs(join(dest, "webapp", "templates", "admin", "auth"))
    copy_file("admin_user_create.html", "webapp/templates/admin/auth/add_user.html")

    # main webapp files
    logger.debug("Rendering and writing webapp files.")
    copy_file('__init__.py', 'webapp/__init__.py')
    for rel_path, code in coder.itercode():
        write_string(code, rel_path)


    # static
    logger.debug("Copying static files, and writing CSS.")
    f_transporter('jslibs', 'webapp/static/jslibs', shutil.copytree)
    f_transporter('img', 'webapp/static/img', shutil.copytree)
    copy_file('ajaxify.js', 'webapp/static/ajaxify.js')
    copy_file('css/appcubator-override.css', 'webapp/static/appcubator-override.css')
    copy_file('css/bootstrap-responsive.css', 'webapp/static/bootstrap-responsive.css')
    copy_file('css/reset.css', 'webapp/static/reset.css')
    copy_file('utils.py', 'webapp/utils.py')
    write_string(css, 'webapp/static/style.css') # TODO write css

    logger.info("Finished writing django app.")

    return dest
