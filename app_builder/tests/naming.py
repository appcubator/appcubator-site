import unittest
from app_builder.naming import Namespace, Identifier


class NewIdentifierTestCase(unittest.TestCase):

    def setUp(self):
        self.n = Namespace()

    def test_basics(self):
        i = self.n.new_identifier('test')
        i2 = self.n.new_identifier('test')
        self.assertNotEqual(i.identifier, i2.identifier)


class NestingTestCase(unittest.TestCase):

    def setUp(self):

        #       n3    >>    (n1 >> n2)

        n1 = Namespace()
        i1 = n1.new_identifier('simplejson')

        # example of building from parents down
        n2 = Namespace(parent_namespace=n1)
        i2 = n2.new_identifier('simplejson')

        # example from building parent afterward and adding children
        n3 = Namespace()
        i3 = n3.new_identifier('simplejson')
        n3.add_child_namespace(n1)

        self.i1, self.i2, self.i3 = (i1, i2, i3)
        self.n1, self.n2, self.n3 = (n1, n2, n3)

    def test_internals(self):
        self.assertEqual(self.n3.parent_namespace, None)
        self.assertEqual(self.n1.parent_namespace, self.n3)
        self.assertEqual(self.n2.parent_namespace, self.n1)

        self.assertEqual(self.n3.child_namespaces, [self.n1])
        self.assertEqual(self.n1.child_namespaces, [self.n2])
        self.assertEqual(self.n2.child_namespaces, [])

    def test_resolved(self):
        print self.i1, self.i2, self.i3
        self.assertNotEqual(self.i1.identifier, self.i2.identifier)
        self.assertNotEqual(self.i2.identifier, self.i3.identifier)
        self.assertNotEqual(self.i1.identifier, self.i3.identifier)


class NewIdentifierTestCase(unittest.TestCase):

    def setUp(self):
        n1 = Namespace()
        i1 = n1.new_identifier('simplejson')

        # example of building from parents down
        n2 = Namespace(parent_namespace=n1)
        i2 = n2.new_identifier('simplejson')

        # example from building parent afterward and adding children
        n3 = Namespace()
        i3 = n3.new_identifier('simplejson')
        n3.add_child_namespace(n1)

        self.i1, self.i2, self.i3 = (i1, i2, i3)
        self.n1, self.n2, self.n3 = (n1, n2, n3)

    def test_used_ids_print_order(self):
        self.assertEqual([str(i)
                         for i in self.n2.used_ids()], ['simplejson3', 'simplejson2', 'simplejson'])


if __name__ == "__main__":
    unittest.main()
