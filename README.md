v1Factory
=========

Update (6/14/2014)
------------------

This site is in an intermediate state of transition
from old appcubator to new appcubator, and is no longer maintained.
It used to host the editor statics, store users and app states in a DB.
It connects to `appmake` and `deployment` to provide codegen and hosting functionality.

Post-mortem plan:
The conceptual ideas and learnings of Appcubator will be published
and released in a series of blog posts, and `appcubator.com` will 302 to `blog.appcubator.com`.


Goal
----

Futuristic app-development. Get started quick with a visual editor,
don't deal with web servers, databases, web security, repository config.
If you know python and have a sense of design, you can make a web app.

Installation
------------

1. Start a virtualenv
```
virtualenv --distribute venv
. venv/bin/activate
```

2. Install dependencies
```
pip install -r requirements.txt
```

4. Make manage.py executable
```
chmod +x manage.py
```

5. Setup the database
```
./manage.py syncdb --noinput
./manage.py migrate
```

6. Go
```
./manage.py runserver
```

