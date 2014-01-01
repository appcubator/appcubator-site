import unittest
from app_builder.codes import DjangoField, DjangoModel, DjangoPageView, DjangoTemplate, DjangoURLs, DjangoStaticPagesTestCase, DjangoQuery, DjangoForm, DjangoFormReceiver, Import
from app_builder.naming import Namespace
from app_builder.codes import create_import_namespace
from app_builder.analyzer.uielements import Node, Layout


class ImportTestCase(unittest.TestCase):

    def setUp(self):
        ns = Namespace()

        # say you wanted to import both the simplejson and django.utils.simplejson:
        id1 = ns.new_identifier('simplejson')
        imp1 = Import('simplejson', id1)

        id2 = ns.new_identifier('simplejson')
        imp2 = Import('simplejson', id2, from_string='django.utils')

        # now, just a normal from import
        imp3 = Import('checker', ns.new_identifier('checker'), from_string='pyflakes.api')

        self.imp1, self.imp2 = (imp1, imp2)
        self.imp3 = imp3

    def test_it_works(self):
        self.assertEqual(self.imp1.render(), 'import simplejson')
        self.assertEqual(self.imp2.render(), 'from django.utils import simplejson as simplejson2')
        self.assertEqual(self.imp3.render(), 'from pyflakes.api import checker')

    def test_pollute_ns(self):
        # some dumbo make a variable called re
        # but now you want to import re!
        # so whad'you do?
        ns = Namespace()
        ns.new_identifier('re')
        i = Import('re', ns.new_identifier('re'))
        self.assertEqual(i.render(), 'import re as re2')


class DjangoFormCreationTestCase(unittest.TestCase):

    def setUp(self):
        self.ns = create_import_namespace('webapp/forms.py')
        x = self.ns.new_identifier
        form_id = self.ns.new_identifier('test_form')
        model_id = x('test_model')
        field_ids = [x(i) for i in "tf1 tf2 tf3".split()]
        self.form = DjangoForm(form_id, model_id, field_ids)

    def test_render(self):
        self.assertNotIn('import', self.form.render())


class DjangoFormReceiverCreationTestCase(unittest.TestCase):

    def setUp(self):
        self.ns = create_import_namespace('webapp/form_receivers.py')
        x = self.ns.new_identifier
        form_rec_id = self.ns.new_identifier('test_form_receiver')
        form_id = x('test_form')
        self.fr = DjangoFormReceiver(form_rec_id, form_id)

    def test_render(self):
        self.assertNotIn('import', self.fr.render())


class DjangoFieldCreationTestCase(unittest.TestCase):

    def test_django_type(self):
        f = DjangoField("some_id", "text")
        self.assertEqual(f.django_type, 'TextField')
        f = DjangoField("some_id", "number")
        self.assertEqual(f.django_type, 'FloatField')


class DjangoFieldKwargsTestCase(unittest.TestCase):

    def setUp(self):
        self.canon_types = [
            'text', 'number', 'date', 'email', 'image', '_CREATED', '_MODIFIED', ]

    def test_required_kwarg(self):
        for t in self.canon_types:
            f = DjangoField("some_id", t, required=True)
            f2 = DjangoField("some_id", t, required=False)
            self.assertNotIn('blank', f.kwargs())
            self.assertTrue(f2.kwargs()['blank'])

    def test_auto_created(self):
        f = DjangoField("some_id", '_CREATED')
        f2 = DjangoField("some_id", '_MODIFIED')
        self.assertTrue(f.kwargs()['auto_now_add'])
        self.assertTrue(f2.kwargs()['auto_now'])


class DjangoModelCreateFieldTestCase(unittest.TestCase):

    def setUp(self):
        self.ns = create_import_namespace('webapp/models.py')
        self.model = DjangoModel(self.ns.new_identifier("test_model"))

    def test_create_field(self):
        self.model.create_field("idk", "text", True)
        self.model.create_field("idk2", "number", True)
        self.model.create_field("idk2", "date", True)

        self.assertEqual(len(self.model.fields), 3)


class DjangoModelCreateRelatedFieldTestCase(unittest.TestCase):

    def setUp(self):
        self.ns = create_import_namespace('webapp/models.py')
        self.model = DjangoModel(self.ns.new_identifier("test_model"))
        self.rel_model = DjangoModel(self.ns.new_identifier("some other model"))

    def test_create_field(self):
        rel_name = self.rel_model.namespace.new_identifier('')
        self.model.create_relational_field("fk test", "fk", self.rel_model.identifier, rel_name, False)

        rel_name = self.rel_model.namespace.new_identifier('')
        self.model.create_relational_field("121 test", "o2o", self.rel_model.identifier, rel_name, True)

        rel_name = self.rel_model.namespace.new_identifier('')
        self.model.create_relational_field("mm test", "m2m", self.rel_model.identifier, rel_name, True)

        print self.model.render()
        self.assertEqual(len(self.model.fields), 3)




class DjangoModelTestCase(unittest.TestCase):

    def setUp(self):
        self.ns = create_import_namespace('webapp/models.py')
        self.model = DjangoModel(self.ns.new_identifier("test_model"))

        self.model.create_field("idk", "text", True)
        self.model.create_field("idk2", "number", True)
        self.model.create_field("idk2", "date", True)

    def test_render(self):
        self.assertNotIn('import', self.model.render())


class DjangoPageViewTestCase(unittest.TestCase):

    def setUp(self):
        self.ns = create_import_namespace('webapp/pages.py')

    def test_creation(self):
        view = DjangoPageView(self.ns.new_identifier("test_view"))
        self.assertEqual(view.code_path, 'webapp/pages.py')
        self.assertIsInstance(view.namespace, Namespace)

    def test_create_with_args(self):
        d1, d2, d3 = ({'1': 1}, {'2': 2}, {'3': 3})
        view = DjangoPageView(self.ns.new_identifier(
            "test_view"), args=[('user', d1), ('user2', d2), ('book', d3)])
        self.assertEqual([(str(i), b)
                         for i, b in view.args], [('user', d1), ('user2', d2), ('book', d3)])

    def test_safety_of_args(self):
        d1, d2, d3 = ({'1': 1}, {'2': 2}, {'3': 3})
        view = DjangoPageView(self.ns.new_identifier("test_view"), args=[
                              ('user', d1), ('user', d2), ('request', d3)])
        self.assertEqual(len(view.args), 3)
        self.assertNotIn('request', [
                         a for a, d in view.args])  # request is not allowed to be an arg since it's the first fn arg.
        self.assertNotEqual(view.args[0][0], view.args[1][0])

    def test_add_query(self):
        dq = DjangoQuery('User')
        dq2 = DjangoQuery('User')
        dq3 = DjangoQuery('Book')

        d1, d2, d3 = ({'1': 1}, {'2': 2}, {'3': 3})
        view = DjangoPageView(self.ns.new_identifier("test_view"), args=[])

        view.add_query(dq)
        view.add_query(dq2)
        view.add_query(dq3)

        for q in view.queries:
            self.assertIn(q[0], view.pc_namespace.used_ids())
            self.assertIsInstance(q[1], str)
            self.assertEqual(len(q), 2)

    def test_render(self):
        d1, d2, d3 = ({'template_id': 'user', 'model_id': 'User'},
                      {'template_id': 'user2', 'model_id': 'User'},
                      {'template_id': 'request2', 'model_id': 'Request'})
        dq = DjangoQuery('User')
        dq2 = DjangoQuery('User')
        dq3 = DjangoQuery('Book')

        view = DjangoPageView(self.ns.new_identifier("test_view"), args=[('user_id', d1), ('user2_id', d2), (
            'request_id', d3)], template_code_path="wsup/test_path.html", queries=(dq, dq2, dq3))
        self.assertNotIn('import', view.render())


class DjangoURLTestCase(unittest.TestCase):

    def setUp(self):
        ns = create_import_namespace('webapp/urls.py')
        urlpatterns_id = ns.new_identifier('urlpatterns')
        self.url = DjangoURLs('test.module.name', ns, urlpatterns_id, first_time=False)
        f_id = ns.new_identifier('random function')
        self.url.routes.append(('\'randomstringgoeshere\'', f_id))

    def test_render(self):
        self.assertNotIn('import', self.url.render())

    def test_first_time(self):
        with_plus_sign = self.url.render()
        self.url.first_time = True
        without_plus_sign = self.url.render()

        self.assertIn('+=', with_plus_sign)
        self.assertNotIn('+=', without_plus_sign)

    # ability to add things to page context
    # ability to get the names of ceratin things in the page context


class DjangoTemplateSplitToRowsTestCase(unittest.TestCase):

    def setUp(self):
        self.template = DjangoTemplate("test_template")

    def test_rows_are_divided_if_separated(self):
        node1 = Node(layout=Layout(
            top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(
            top=6, left=0, width=5, height=5), content="")
        node3 = Node(layout=Layout(
            top=12, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 3)

        self.assertEqual(rows[0].margin_top, 0)
        self.assertEqual(rows[1].margin_top, 1)
        self.assertEqual(rows[2].margin_top, 1)

    def test_rows_are_divided_if_sep_but_touching(self):
        node1 = Node(layout=Layout(
            top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(
            top=5, left=0, width=5, height=5), content="")
        node3 = Node(layout=Layout(
            top=10, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 3)

        self.assertEqual(rows[0].margin_top, 0)
        self.assertEqual(rows[1].margin_top, 0)
        self.assertEqual(rows[2].margin_top, 0)

    def test_rows_are_not_divided_if_overlap(self):
        node1 = Node(layout=Layout(
            top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(
            top=4, left=0, width=5, height=5), content="")
        node3 = Node(layout=Layout(
            top=8, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 1)

        self.assertEqual(rows[0].margin_top, 0)

    def test_rows_are_not_divided_if_side_by_side(self):
        node1 = Node(layout=Layout(
            top=0, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(
            top=0, left=20, width=5, height=5), content="")
        node3 = Node(layout=Layout(
            top=20, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels)
        self.assertEqual(len(rows), 2)
        self.assertEqual(len(rows[0].uiels), 2)
        self.assertEqual(len(rows[1].uiels), 1)

        self.assertEqual(rows[0].margin_top, 0)
        self.assertEqual(rows[1].margin_top, 15)

    def test_top_offset(self):
        node1 = Node(layout=Layout(
            top=10, left=0, width=5, height=5), content="")
        node2 = Node(layout=Layout(
            top=10, left=20, width=5, height=5), content="")
        node3 = Node(layout=Layout(
            top=30, left=0, width=5, height=5), content="")
        uiels = [node1, node2, node3]

        rows = self.template.split_to_rows(uiels, top_offset=9)
        self.assertEqual(len(rows), 2)
        self.assertEqual(len(rows[0].uiels), 2)
        self.assertEqual(len(rows[1].uiels), 1)

        self.assertEqual(rows[0].margin_top, 1)
        self.assertEqual(rows[1].margin_top, 15)


class DjangoTemplateSplitToColsTestCase(unittest.TestCase):

    def setUp(self):
        self.template = DjangoTemplate("test_template")

    def test_cols_are_divided_if_separated(self):
        node1 = Node(layout=Layout(
            left=0, top=0, height=5, width=5), content="")
        node2 = Node(layout=Layout(
            left=6, top=0, height=5, width=5), content="")
        node3 = Node(layout=Layout(
            left=12, top=0, height=5, width=5), content="")
        uiels = [node1, node2, node3]

        cols = self.template.split_to_cols(uiels)
        self.assertEqual(len(cols), 3)

        self.assertEqual(cols[0].margin_left, 0)
        self.assertEqual(cols[1].margin_left, 1)
        self.assertEqual(cols[2].margin_left, 1)

    def test_cols_are_divided_if_sep_but_touching(self):
        node1 = Node(layout=Layout(
            left=0, top=0, height=5, width=5), content="")
        node2 = Node(layout=Layout(
            left=5, top=0, height=5, width=5), content="")
        node3 = Node(layout=Layout(
            left=10, top=0, height=5, width=5), content="")
        uiels = [node1, node2, node3]

        cols = self.template.split_to_cols(uiels)
        self.assertEqual(len(cols), 3)

        self.assertEqual(cols[0].margin_left, 0)
        self.assertEqual(cols[1].margin_left, 0)
        self.assertEqual(cols[2].margin_left, 0)

    def test_cols_are_not_divided_if_overlap(self):
        node1 = Node(layout=Layout(
            left=0, top=0, height=5, width=5), content="")
        node2 = Node(layout=Layout(
            left=4, top=0, height=5, width=5), content="")
        node3 = Node(layout=Layout(
            left=8, top=0, height=5, width=5), content="")
        uiels = [node1, node2, node3]

        cols = self.template.split_to_cols(uiels)
        self.assertEqual(len(cols), 1)

        self.assertEqual(cols[0].margin_left, 0)

    def test_cols_are_not_divided_if_side_by_side(self):
        node1 = Node(layout=Layout(
            left=0, top=0, height=5, width=5), content="")
        node2 = Node(layout=Layout(
            left=0, top=20, height=5, width=5), content="")
        node3 = Node(layout=Layout(
            left=20, top=0, height=5, width=5), content="")
        uiels = [node1, node2, node3]

        cols = self.template.split_to_cols(uiels)
        self.assertEqual(len(cols), 2)
        self.assertEqual(len(cols[0].uiels), 2)
        self.assertEqual(len(cols[1].uiels), 1)

        self.assertEqual(cols[0].margin_left, 0)
        self.assertEqual(cols[1].margin_left, 15)

    def test_left_offset(self):
        node1 = Node(layout=Layout(
            left=10, top=0, height=5, width=5), content="")
        node2 = Node(layout=Layout(
            left=10, top=20, height=5, width=5), content="")
        node3 = Node(layout=Layout(
            left=30, top=0, height=5, width=5), content="")
        uiels = [node1, node2, node3]

        cols = self.template.split_to_cols(uiels, left_offset=9)
        self.assertEqual(len(cols), 2)
        self.assertEqual(len(cols[0].uiels), 2)
        self.assertEqual(len(cols[1].uiels), 1)

        self.assertEqual(cols[0].margin_left, 1)
        self.assertEqual(cols[1].margin_left, 15)


class DjangoTemplateCreateTreeTestCase(unittest.TestCase):

    def setUp(self):
        self.template = DjangoTemplate("test_template")

    def test_simple(self):
        #**************************
        #*   ********             *
        #*   *      *             *
        #*   *      *   ********* *
        #*   *      *   *       * *
        #*   ********   *       * *
        #*              *       * *
        #*              ********* *
        #*                        *
        #*   ********             *
        #*   *      *   ********  *
        #*   *      *   ********  *
        #*   ********             *
        #*                        *
        #*         ******         *
        #*         *    *         *
        #*         *    *         *
        #*         ******         *
        #*                        *
        #**************************
        node11 = Node(layout=Layout(
            left=2, top=0, height=5, width=5), content="")
        node12 = Node(layout=Layout(
            left=8, top=3, height=5, width=5), content="")

        node21 = Node(layout=Layout(
            left=2, top=9, height=5, width=5), content="")
        node22 = Node(layout=Layout(
            left=8, top=10, height=2, width=5), content="")

        node3 = Node(layout=Layout(
            left=7, top=15, height=5, width=5), content="")

        uiels = [node12, node22, node3, node11,
                 node21]  # order should not matter.

        self.template.create_tree(uiels)

        self.assertEqual(node11, self.template.tree.rows[0].cols[0].uiels[0])
        self.assertEqual(node12, self.template.tree.rows[0].cols[1].uiels[0])
        self.assertEqual(node21, self.template.tree.rows[1].cols[0].uiels[0])
        self.assertEqual(node22, self.template.tree.rows[1].cols[1].uiels[0])
        self.assertEqual(node3, self.template.tree.rows[2].cols[0].uiels[0])

        self.assertEqual(self.template.tree.rows[0].margin_top, 0)
        self.assertEqual(self.template.tree.rows[1].margin_top, 1)
        self.assertEqual(self.template.tree.rows[2].margin_top, 1)

        self.assertEqual(self.template.tree.rows[0].cols[0].margin_left, 2)
        self.assertEqual(self.template.tree.rows[0].cols[1].margin_left, 1)

        self.assertEqual(self.template.tree.rows[1].cols[0].margin_left, 2)
        self.assertEqual(self.template.tree.rows[1].cols[1].margin_left, 1)

        self.assertEqual(self.template.tree.rows[2].cols[0].margin_left, 7)

    def test_recursive(self):
        #**************************
        #*   ********             *
        #*   *      * *****  ***  *
        #*   *      * *   *  * *  *
        #*   ******** *   *  * *  *
        #*            *****  * *  *
        #*   *************   * *  *
        #*   *           *   ***  *
        #*   *           *        *
        #*   *************        *
        #**************************
        node1 = Node(layout=Layout(
            left=2, top=9, height=5, width=5), content="")
        node2 = Node(layout=Layout(
            left=8, top=10, height=5, width=3), content="")
        node3 = Node(layout=Layout(
            left=12, top=10, height=8, width=5), content="")
        node4 = Node(layout=Layout(
            left=2, top=16, height=2, width=8), content="")

        uiels = [node2, node1, node4, node3]  # order should not matter.

        self.template.create_tree(uiels)

        self.assertEqual(self.template.tree.rows[0].margin_top, 9)
        self.assertEqual(node1, self.template.tree.rows[
                         0].cols[0].tree.rows[0].cols[0].uiels[0])
        self.assertEqual(node2, self.template.tree.rows[
                         0].cols[0].tree.rows[0].cols[1].uiels[0])
        self.assertEqual(node3, self.template.tree.rows[0].cols[1].uiels[0])
        self.assertEqual(node4, self.template.tree.rows[
                         0].cols[0].tree.rows[1].cols[0].uiels[0])

    def test_not_splittable(self):
        #*****************************
        #*   ******  ***********     *
        #*   *    *  *         *     *
        #*   *    *  *         *     *
        #*   *    *  ***********     *
        #*   *    *                  *
        #*   *    *       ******     *
        #*   *    *       *    *     *
        #*   ******       *    *     *
        #*   ************ *    *     *
        #*   *          * *    *     *
        #*   *          * *    *     *
        #*   *          * ******     *
        #*   ************            *
        #*****************************

        node1 = Node(layout=Layout(
            left=2, top=2, height=7, width=3), content="")
        node2 = Node(layout=Layout(
            left=6, top=2, height=3, width=7), content="")
        node3 = Node(layout=Layout(
            left=2, top=10, height=3, width=7), content="")
        node4 = Node(layout=Layout(
            left=10, top=6, height=7, width=3), content="")

        uiels = [node2, node1, node4, node3]  # order should not matter.

        self.template.create_tree(uiels)
        self.assertEqual(len(self.template.tree.rows), 1)
        self.assertEqual(len(self.template.tree.rows[0].cols), 1)
        self.assertTrue(self.template.tree.rows[
                        0].cols[0].has_overlapping_nodes)
        self.assertEqual(self.template.tree.rows[
                         0].cols[0].container_height, 11)
        for u in self.template.tree.rows[0].cols[0].uiels:
            self.assertTrue(hasattr(u, 'overlap_styles'))

if __name__ == '__main__':
    unittest.main()
