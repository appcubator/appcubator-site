from optparse import make_option
import sys

from django.utils.translation import activate as activate_language
from django.core.exceptions import ImproperlyConfigured
from django.core.management.base import BaseCommand
from django.template import loader, Context
from haystack.backends.solr_backend import SolrSearchBackend
from haystack.constants import ID, DJANGO_CT, DJANGO_ID, DEFAULT_OPERATOR, DEFAULT_ALIAS

SUPPORTED_LANGUAGES = ['en', 'es', 'ru', 'cn', \
                       'zn', 'fr', 'jp', 'ko', 'de']


class Command(BaseCommand):
    help = "Generates a Solr schema that reflects the indexes."
    base_options = (
        make_option("-f", "--filename", action="store", type="string", dest="filename",
                    help='If provided, directs output to a file instead of stdout.'),
        make_option("-u", "--using", action="store", type="string", dest="using", default=DEFAULT_ALIAS,
                    help='If provided, chooses a connection to work with.'),
        make_option("-l", "--language", action="store", type="string", dest="language", default='en',
                    help='Language to user, in language code format')
    )
    option_list = BaseCommand.option_list + base_options

    def handle(self, *args, **options):
        """Generates a Solr schema that reflects the indexes."""
        using = options.get('using')
        language = options.get('language')[:2]
        activate_language(language)
        if language not in SUPPORTED_LANGUAGES:
            sys.stderr.write("\n\n")
            sys.stderr.write("WARNING: your language: '%s' is not supported in our " % language)
            sys.stderr.write("template it will default to English more information in http://wiki.apache.org/solr/LanguageAnalysis")
            sys.stderr.write("\n\n")
        schema_xml = self.build_template(using=using, language=language)

        if options.get('filename'):
            self.write_file(options.get('filename'), schema_xml)
        else:
            self.print_stdout(schema_xml)

    def build_context(self, using, language='en'):
        from haystack import connections, connection_router
        backend = connections[using].get_backend()

        if not isinstance(backend, SolrSearchBackend):
            raise ImproperlyConfigured("'%s' isn't configured as a SolrEngine)." % backend.connection_alias)

        content_field_name, fields = backend.build_schema(connections[using].get_unified_index().all_searchfields())
        return Context({
            'content_field_name': content_field_name,
            'fields': fields,
            'default_operator': DEFAULT_OPERATOR,
            'ID': ID,
            'DJANGO_CT': DJANGO_CT,
            'DJANGO_ID': DJANGO_ID,
            'language': language,
        })

    def build_template(self, using, language='en'):
        t = loader.get_template('search_configuration/askbotsolr.xml')
        c = self.build_context(using=using, language=language)
        return t.render(c)

    def print_stdout(self, schema_xml):
        sys.stderr.write("\n")
        sys.stderr.write("\n")
        sys.stderr.write("\n")
        sys.stderr.write("Save the following output to 'schema.xml' and place it in your Solr configuration directory.\n")
        sys.stderr.write("--------------------------------------------------------------------------------------------\n")
        sys.stderr.write("\n")
        print schema_xml

    def write_file(self, filename, schema_xml):
        schema_file = open(filename, 'w')
        schema_file.write(schema_xml)
        schema_file.close()
