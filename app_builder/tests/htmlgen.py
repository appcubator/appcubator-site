import unittest
import re
from app_builder.htmlgen import Tag


class HtmlGenBasicTestCase(unittest.TestCase):

    def test_some_text(self):
        ptag = Tag('p', {}, content="Hulloooo")

        self.assertHtmlEqual(ptag.render(), "<p>Hulloooo</p>")

    def test_nest(self):
        ptag = Tag('p', {},
                   content=Tag('p', {}, content="Hulloooo"))

        self.assertHtmlEqual(ptag.render(), "<p><p>Hulloooo</p></p>")

    def test_nest_list(self):
        ptag = Tag('body', {},
                   content=(Tag('p', {}, content="A"),
                            Tag('span', {}, content="B"),
                   Tag('a', {}, content=Tag('p', {}, content="C"))),
                   )

        self.assertHtmlEqual(ptag.render(),
            "<body><p>A</p><span>B</span><a><p>C</p></a></body>")

    def assertHtmlEqual(self, a, b):
        def remove_whitespace(s):
            return re.sub(r'\s', '', s)

        self.assertEqual(remove_whitespace(a),remove_whitespace(b))

    def test_no_content(self):
        tag = Tag('p', {})
        self.assertHtmlEqual(tag.render(), '<p></p>')

    def test_void_tag(self):
        br = Tag('br', {})
        self.assertHtmlEqual(br.render(), '<br>')

    def test_attribs(self):
        atag = Tag('a', {'href': 'http://google.com/'}, content="Google")
        self.assertHtmlEqual(
            atag.render(), '<a href="http://google.com/">Google</a>')

    def test_id_class_style_attrib_order(self):
        kwargs = {'id': "container",
                  'class': "some classes here",
                  'style': "position:absolute",
                  'alt': "This is after the others"}
        div = Tag('div', kwargs, content="Test")
        self.assertHtmlEqual(
            div.render(), '<div id="container" class="some classes here" style="position:absolute" alt="This is after the others">Test</div>')

    def test_html_escape(self):
        atag = Tag('a', {'href': 'http:"><script'}, content="Google")
        wrapper = Tag('div', {}, content=atag)
        self.assertHtmlEqual(
            wrapper.render(), '<div><a href="http:&#34;&gt;&lt;script">Google</a></div>')

if __name__ == "__main__":
    unittest.main()
