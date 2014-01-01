from jinja2 import Environment, FileSystemLoader, StrictUndefined
import os.path

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=FileSystemLoader(
    os.path.join(os.path.dirname(__file__), 'code_templates')), undefined=StrictUndefined)
"""
	Codes represent different ways to map different Django code components (referred to as identifiers)
	to actual code from an internal representation made by analyzer. Some of these codes are coupled
	such as imports which may be used in different code components such as models.

	For each code component, we have a code_template that is written in the jinja2 framework that 
	lets us template the code. These templates are in the code_templates folder. To isolate of rendering this
	each codes/ file has the logic that provide the right properties that can be accessed and placed there.
	Since jinja2 supports inhertance we can combine different templates.
"""

from models import *
from views import *
from forms import *
from urls import *
from tests import *
from imports import *
from templates import *
from emails import *
