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

3. Tell django which settings to use (set and forget)
```
export DJANGO_SETTINGS_MODULE=v1factory.settings.dev
```

4. Go
```
python manage.py runserver 0.0.0.0:8000
```
