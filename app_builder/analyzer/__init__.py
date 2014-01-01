from jinja2 import Environment, FileSystemLoader
import os.path

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=FileSystemLoader(
    os.path.join(os.path.dirname(__file__), 'templates')))

import logging
logger = logging.getLogger("app_builder.analyzer")

def assert_raise(true_condition, exception):
    if not true_condition:
        raise exception

class UserInputError(Exception):
    def __init__(self, message, path):
        """
        Takes a human-readable error and the path where the problem occurred.
        """
        self.message = message
        self.path = path

    def to_dict(self):
        return {'message': self.message,
                'path': self.path }

    def __unicode__(self):
        return self.__str__()

    def __str__(self):
        return "%s\nPath: %s" % (self.message, self,path)

from analyzer import *
from dict_inited import InvalidDict

