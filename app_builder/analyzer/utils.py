
def encode_braces(s):
    return '{{%s}}' % s.replace('{', '\{')


def decode_braces(s):
    assert s.startswith('{{') and s.endswith('}}'), "Not brace encoded: %r" % s
    return s[2:-2].replace('\{', '{')

