from app_builder import naming
from app_builder.htmlgen import Tag

from . import env


class Column(object):

    def __init__(self):
        self.uiels = []
        self.margin_left = 0
        self.margin_top = 0
        self.width = 0
        self.tree = None
        self.has_overlapping_nodes = False

    @property
    def classes(self):
        classes = ['span%d' % self.width]
        if self.margin_left > 0:
            classes.append('offset%d' % self.margin_left)
        if self.margin_top > 0:
            classes.append('hoff%d' % self.margin_top)
        if self.has_overlapping_nodes:
            classes.append('hi%d' % self.container_height)
        return classes

    @property
    def class_string(self):
        return ' '.join(self.classes)

    @property
    def styles(self):
        styles = []
        if self.has_overlapping_nodes:
            styles.append('position:relative')
        return styles

    @property
    def style_string(self):
        return '; '.join(self.styles)

    def render(self):
        def absolutify(el, html):
            html.style_string += el.overlap_styles
            return html

        def layoutify(el, html):
            html.class_string += ' hi%d span%d' % (el.layout.height, el.layout.width)
            return html

        def add_padding(el, html):
            if el.layout.has_padding():
                html.style_string += "; padding: %dpx %dpx %dpx %dpx" % (
                    el.layout.t_padding, el.layout.r_padding, el.layout.b_padding, el.layout.l_padding)
            return html

        def add_text_align(el, html):
            if el.layout.alignment != 'left':
                # create wrapper if not already wrapper
                if html.is_wrapper:
                    wrapper = html
                else:
                    wrapper = Tag('div', {}, content=html)
                wrapper.style_string += "; text-align: %s" % el.layout.alignment
                return wrapper
            else:
                return html

        if self.has_overlapping_nodes:
            # set position absolute, with pixel dimensions, all in the style attribute
            htmls = [ el.html() for el in self.uiels ]
            htmls = [ add_padding(el, layoutify(el, absolutify(el, add_text_align(el, html)))) for el, html in zip(self.uiels, htmls) ]

            column_element = Tag('div', { 'class': self.class_string,
                                       'style': self.style_string }, content=htmls)

        else:
            el = self.uiels[0]
            html = el.html()
            column_element = add_padding(el, layoutify(el, add_text_align(el, html)))
            column_element.class_string += ' ' + self.class_string

        return column_element.render()


class Row(object):

    def __init__(self):
        self.uiels = []
        self.margin_top = 0
        self.cols = None

    @property
    def classes(self):
        classes = ['row']
        if self.margin_top > 0:
            classes.append('hoff%d' % self.margin_top)
        return classes

    @property
    def class_string(self):
        return ' '.join(self.classes)


class DomTree(object):

    def __init__(self):
        self.rows = []


class DjangoTemplate(object):

    def __init__(self, identifier):
        self.identifier = identifier
        self.filename = '%s.html' % identifier
        self.code_path = "webapp/templates/" + self.filename
        self.css_nodes = []
        self.js_nodes = []

    def split_to_cols(self, uiels, left_offset=0):
        """Given some uielements, separate them into non-overlapping columns"""
        cols = []
        if len(uiels) == 0:
            return cols

        sorted_uiels = sorted(uiels, key=lambda u: u.layout.left)

        # leftmost uiel must be in the row
        current_col = Column()
        cols.append(current_col)
        current_block = sorted_uiels.pop(0)
        current_col.uiels.append(current_block)
        current_col.margin_left = current_block.layout.left - left_offset

        # iterate over the uiels left down
        for u in sorted_uiels:
            current_right = current_block.layout.left + \
                current_block.layout.width
            u_left = u.layout.left
            u_right = u_left + u.layout.width

            # Two cases:
            # 1. this block is in the current row.
            if u_left < current_right:
                current_col.uiels.append(u)
                    # a. this block is extends longer than the current block
                if u_right > current_right:
                    current_block = u
            # 2. this block must be the left-most block in a new row
            else:
                current_col.width = current_right - \
                    current_col.uiels[0].layout.left

                current_col = Column()
                cols.append(current_col)

                current_col.uiels.append(u)
                current_col.margin_left = u_left - current_right

                current_block = u

        # set the width of the last column
        current_right = current_block.layout.left + current_block.layout.width
        current_col.width = current_right - current_col.uiels[0].layout.left

        return cols

    def split_to_rows(self, uiels, top_offset=0):
        """Given some uielements, separate them into non-overlapping rows"""
        # do a top down sweep, to identify continuous areas of emptiness
        # start with an empty row, and include the top-most block
        # then see if there are other blocks which lie on top of this.bottom_boundary.
        # if there are, add it to this row. start with that block and try again
        # if not, then end the row. create a new row and repeat if there are
        # more blocks to place.

        rows = []
        if len(uiels) == 0:
            return rows

        sorted_uiels = sorted(uiels, key=lambda u: u.layout.top)

        # topmost uiel must be in the row
        current_row = Row()
        rows.append(current_row)
        current_block = sorted_uiels.pop(0)
        current_row.uiels.append(current_block)
        current_row.margin_top = current_block.layout.top - top_offset

        # iterate over the uiels top down
        for u in sorted_uiels:
            current_bottom = current_block.layout.top + \
                current_block.layout.height
            u_top = u.layout.top
            u_bottom = u_top + u.layout.height

            # Two cases:
            # 1. this block is in the current row.
            if u_top < current_bottom:
                current_row.uiels.append(u)
                    # a. this block is extends longer than the current block
                if u_bottom > current_bottom:
                    current_block = u
            # 2. this block must be the top-most block in a new row
            else:
                current_row = Row()
                rows.append(current_row)

                current_row.uiels.append(u)
                current_row.margin_top = u_top - current_bottom

                current_block = u

        return rows

    def create_tree(self, uiels):
        self.tree = self._create_tree(uiels)

    def _create_tree(self, uiels, recursive_num=0, top_offset=0, left_offset=0):
        """Given some uielements, create a nested row -> column -> row -> ... -> column -> uielement.
           It also detects the situation where splitting into row/column cannot be acheived.
           For that, it makes the column position:relative, and the inner uiels position absolute.
           In this case, it also sets an attribute on uie called "overlap_styles"."""
        tree = DomTree()

        tree.rows = self.split_to_rows(uiels, top_offset=top_offset)
        for i, r in enumerate(tree.rows):
            inner_top_offset = r.uiels[0].layout.top
            r.cols = self.split_to_cols(r.uiels, left_offset=left_offset)
            for c in r.cols:
                inner_left_offset = c.uiels[0].layout.left
                if len(c.uiels) == 1:
                    c.margin_top = c.uiels[0].layout.top - inner_top_offset
                    c.tree = None # termination of recursion
                else:
                    if len(tree.rows) == 1 and len(r.cols) == 1:
                        # in this case, recursion will not terminate since input is not subdivided into smaller components
                        # create a relative container and absolute position the
                        # contents.

                        min_top = c.uiels[0].layout.top
                        max_bottom = c.uiels[0].layout.top + c.uiels[0].layout.height
                        for uie in c.uiels:
                            top_offset = uie.layout.top - inner_top_offset
                            left_offset = uie.layout.left - inner_left_offset
                            uie.overlap_styles = "; position: absolute; top: %spx; left: %spx;" % (
                                15 * top_offset, 80 * left_offset)
                            min_top = min(uie.layout.top, min_top)
                            max_bottom = max(uie.layout.top + uie.layout.height, max_bottom)

                        c.has_overlapping_nodes = True

                        c.container_height = max_bottom - min_top

                        c.tree = None
                    else:
                        c.tree = self._create_tree(
                            c.uiels, top_offset=inner_top_offset, left_offset=inner_left_offset, recursive_num=recursive_num + 1)
        return tree

    def add_css(self, css_node):
        self.css_nodes.append(css_node)

    def add_script(self, js_node):
        self.js_nodes.append(js_node)

    def render(self):
        self.css_code = '\n'.join([ n.render() for n in self.css_nodes ])
        self.js_code = '\n'.join([ n.render() for n in self.js_nodes ])
        return env.get_template('htmlgen/djangotemplate.html').render(template=self)


class DjangoEmailTemplate(object):

    def __init__(self, identifier, template_content):
        self.identifier = identifier
        self.filename = 'email_%s.html' % identifier.replace(' ', '_').lower()
        self.code_path = "webapp/templates/" + self.filename
        self.template_content = template_content

    def render(self):
        return self.template_content


class DjangoBaseHtml(object):
    def __init__(self, description):
        self.description = description
        self.code_path = "webapp/templates/base.html"

    def render(self):
        from jinja2 import escape
        meta_line = """<meta name="description" content="%s">""" % escape(self.description)
        new_base = BASEHTML.replace("#### META LINE ###", meta_line)
        return new_base


BASEHTML = """<!DOCTYPE html>
<html lang="en">
<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <link rel="stylesheet" href="{{ STATIC_URL }}appcubator-override.css"/>
    <link rel="stylesheet" href="{{ STATIC_URL }}bootstrap-responsive.css"/>
    <link rel="stylesheet" href="{{ STATIC_URL }}style.css"/>
    <link rel="stylesheet" href="http://code.jquery.com/ui/1.10.3/themes/smoothness/jquery-ui.css" />

    <title>{% block title %}{% endblock %}</title>
    #### META LINE ###
    <style>
      .list-container {
        overflow-y: scroll;
      }
      .list-entry {
        position: relative;
      }
      .list-container .list-entry .node-wrapper {
        position: absolute;
      }
      .list-container .list-entry .node {
        position: relative;
      }
    </style>
    <script src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"></script>
    <script src="http://code.jquery.com/ui/1.10.3/jquery-ui.js"></script>
    {% block css %}
    {% endblock %}
</head>

<body>
    <!-- fb js sdk -->
    <div id="fb-root"></div>
    <script>(function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];
      if (d.getElementById(id)) return;
      js = d.createElement(s); js.id = id;
      js.src = "//connect.facebook.net/en_US/all.js#xfbml=1&appId=379124615521841";
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));</script>


    <!-- BEGIN NAVBAR -->
    {% block navbar %}
    {% endblock %}
    <!-- END NAVBAR -->


    <div class="row">
      <div class="container" style="position:relative;">
        {% block content %}{% endblock %}
      </div>
    </div>


    <!-- BEGIN FOOTER -->
    {% block footer %}
    {% endblock %}
    <!-- END FOOTER -->


    <script type="text/javascript" src="{{ STATIC_URL }}jslibs/underscore.js"></script>
    <script type="text/javascript" src="{{ STATIC_URL }}jslibs/backbone.js"></script>
    <script type="text/javascript" src="{{ STATIC_URL }}jslibs/bootstrap.min.js"></script>
    <script type="text/javascript" src="//api.filepicker.io/v1/filepicker.js"></script>
    <script type="text/javascript" src="{{ STATIC_URL }}ajaxify.js"></script>

    <script type="text/javascript">
      $(document).ready(function() {
        $('.carousel').carousel().find('.carousel-indicators li').click(function(e) {
          var target = e.currentTarget.dataset.target;
          var index = parseInt(e.currentTarget.dataset.slideTo, 10);
          $(target).data('carousel').pause().to(index).cycle();
        }).end().on('slid', function(e) {
          var $carousel = $(e.currentTarget);
          // reset active indicator on slide change
          // WTF bootstrap carousel is supposed to do this but oh well
          var active = $carousel.find('.item.active');
          var index = active.parent().children().index(active);
          index = parseInt(index, 10);
          $carousel.find('.carousel-indicators li')
                   .removeClass('active')
                   .eq(index).addClass('active');
        });
      });
    </script>
    <script type="text/javascript">
        // sticky footer
        var offset = $('#footer').offset().top;
        var height = $('#footer').height();
        var pageHeight = $(document.body).height();

        function resize() {
            if(offset+height < pageHeight) {
                    $('#footer').css('margin-top', pageHeight - (offset+height) - 20);
            }
        }

        resize();

        $(function() {
          $( ".date-picker-input" ).datepicker();
        });
    </script>
    {% block js %}
    {% endblock %}
</body>
</html>
"""
