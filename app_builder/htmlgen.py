from copy import deepcopy
from jinja2 import Environment, FileSystemLoader, StrictUndefined
import os

env = Environment(trim_blocks=True, lstrip_blocks=True, loader=FileSystemLoader(
    os.path.join(os.path.dirname(__file__), 'analyzer/templates')), undefined=StrictUndefined, autoescape=True)

valid_tags = ('a', 'abbr', 'address', 'area', 'article',
              'aside', 'audio', 'b', 'base', 'bdi',
              'bdo', 'blockquote', 'body', 'br', 'button',
              'canvas', 'caption', 'cite', 'code', 'col',
              'colgroup', 'command', 'data', 'datalist', 'dd',
              'del', 'details', 'dfn', 'div', 'dl',
              'dt', 'em', 'embed', 'fieldset', 'figcaption',
              'figure', 'footer', 'form', 'h1', 'h2',
              'h3', 'h4', 'h5', 'h6', 'head', 'header',
              'hr', 'html', 'i', 'iframe', 'img', 'input',
              'ins', 'kbd', 'keygen', 'label', 'legend',
              'li', 'link', 'main', 'map', 'mark',
              'menu', 'meta', 'meter', 'nav', 'noscript',
              'object', 'ol', 'optgroup', 'option', 'output',
              'p', 'param', 'pre', 'progress', 'q',
              'rp', 'rt', 'ruby', 's', 'samp', 'script',
              'section', 'select', 'small', 'source', 'span',
              'strong', 'style', 'sub', 'summary', 'sup',
              'table', 'tbody', 'td', 'textarea', 'tfoot',
              'th', 'thead', 'time', 'title', 'tr', 'track',
              'u', 'ul', 'var', 'video', 'wbr')

void_tags = ('area', 'base', 'br', 'col', 'embed', 'hr',
             'img', 'input', 'keygen', 'link', 'menuitem',
             'meta', 'param', 'source', 'track', 'wbr')


class Tag(object):

    def __init__(self, tagName, attribs, content=None, wrapper=False, nl_to_br=True):
        assert tagName in valid_tags, "Invalid tagName %r" % tagName
        self.tagName = tagName
        self.id_string = attribs.get('id', '')
        self.class_string = attribs.get('class', '')
        self.style_string = attribs.get('style', '')
        self.nl_to_br = nl_to_br
        attribs = deepcopy(attribs)
        try:
            del attribs['id']
        except KeyError:
            pass
        try:
            del attribs['class']
        except KeyError:
            pass
        try:
            del attribs['style']
        except KeyError:
            pass
        self.attribs = attribs
        self._content = content

        self.isSingle = self.tagName in void_tags
        self.is_wrapper = wrapper

    def has_content(self):
        return self._content is not None and self._content != ""

    def content(self):
        def handle_unknown_type(content, nl_to_br=True):
            if content is None:
                return ""
            assert not self.isSingle, "Content doesn't work for single tags"
            if isinstance(content, basestring):
                if nl_to_br:
                    return content.strip().replace('\n', '<br>')
                else:
                    return content.strip()
            try:
                return content.render().strip()
            except AttributeError:
                return '\n'.join([handle_unknown_type(c, nl_to_br=nl_to_br) for c in content]).strip()
        return handle_unknown_type(self._content, nl_to_br=self.nl_to_br)

    def render(self):
        return env.get_template('htmltag.html').render(context=self)

