
# backwards compatibility
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

def expandOnce(generators, genref):
    raise Exception("implement me bro")

def expandAll(app):
    raise Exception("implement me bro")

def compile(app):
    raise Exception("implement me bro")
