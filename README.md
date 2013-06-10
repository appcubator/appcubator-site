v1Factory
=========

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

3. Install Appcubator-codegen
```
pip install git+ssh://git@github.com/appcubator/appcubator-codegen.git
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
