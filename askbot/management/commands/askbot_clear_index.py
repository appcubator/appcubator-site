import sys
from optparse import make_option

from django.core.management import get_commands, load_command_class
from django.utils.translation import activate as activate_language
from django.core.management.base import BaseCommand, CommandError
from django.conf import settings

try:
    from haystack.management.commands.clear_index import Command as ClearCommand
    haystack_option_list = [option for option in ClearCommand.base_options if not option.get_opt_string() != '--verbosity']
except ImportError:
    haystack_option_list = []

class Command(BaseCommand):
    help = "Completely rebuilds the search index by removing the old data and then updating."
    base_options = [make_option("-l", "--language", action="store", type="string", dest="language",
                                help='Language to user, in language code format'),]
    option_list = list(BaseCommand.option_list) + haystack_option_list + base_options

    def handle(self, **options):
        lang_code = options.get('language', settings.LANGUAGE_CODE.lower())
        options['using'] = ['default_%s' % lang_code[:2],]
        activate_language(lang_code)

        klass = self._get_command_class('clear_index')
        klass.handle(*args, **options)

    def _get_command_class(self, name):
        try:
            app_name = get_commands()[name]
            if isinstance(app_name, BaseCommand):
                # If the command is already loaded, use it directly.
                klass = app_name
            else:
                klass = load_command_class(app_name, name)
        except KeyError:
            raise CommandError("Unknown command: %r" % name)
        return klass


    def execute(self, *args, **options):
        """
        Try to execute this command, performing model validation if
        needed (as controlled by the attribute
        ``self.requires_model_validation``). If the command raises a
        ``CommandError``, intercept it and print it sensibly to
        stderr.
        """
        show_traceback = options.get('traceback', False)

        if self.can_import_settings:
            try:
                #language part used to be here
                pass
            except ImportError, e:
                # If settings should be available, but aren't,
                # raise the error and quit.
                if show_traceback:
                    traceback.print_exc()
                else:
                    sys.stderr.write(smart_str(self.style.ERROR('Error: %s\n' % e)))
                sys.exit(1)

        try:
            self.stdout = options.get('stdout', sys.stdout)
            self.stderr = options.get('stderr', sys.stderr)
            if self.requires_model_validation:
                self.validate()
            output = self.handle(*args, **options)
            if output:
                if self.output_transaction:
                    # This needs to be imported here, because it relies on
                    # settings.
                    from django.db import connections, DEFAULT_DB_ALIAS
                    connection = connections[options.get('database', DEFAULT_DB_ALIAS)]
                    if connection.ops.start_transaction_sql():
                        self.stdout.write(self.style.SQL_KEYWORD(connection.ops.start_transaction_sql()) + '\n')
                self.stdout.write(output)
                if self.output_transaction:
                    self.stdout.write('\n' + self.style.SQL_KEYWORD("COMMIT;") + '\n')
        except CommandError, e:
            if show_traceback:
                traceback.print_exc()
            else:
                self.stderr.write(smart_str(self.style.ERROR('Error: %s\n' % e)))
            sys.exit(1)
