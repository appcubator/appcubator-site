README
======
Overview
--------

Welcome to your Appcubator-Generated Django App!

This guide will give you the technical details about your web app,
teach you how to get it up and running,
and go over some best practices for django development.

Info
----

This app is written in the python programming language, and uses the Django web framework.
By default, it's configured to use Sqlite, the most widely deployed SQL database engine in the world.


Installation
------------

First, make sure you have python 2.7, sqlite, and easy_install.
The easiest way to get started is to use virtualenv to manage your packages.

    sudo easy_install virtualenv

Then, cd into the directory containing this README.

First we'll install the python packages your app requires..

    virtualenv --distribute --no-site-packages venv
    source venv/bin/activate
    pip install -r requirements.txt --upgrade

All packages should now be installed. Now create your database.

    python manage.py syncdb

You're done setting up your app! Run the development webserver.

    python manage.py runserver

To see your app in action, navigate to the following URL in your browser:

    http://127.0.0.1:8000/


Technical Explanation
---------------------

The directory structure is as follows:

./
    requirements.txt

    __init__.py
    manage.py
    wsgi.py
    urls.py

    settings/
        common.py
        dev.py
        prod.py

    webapp/
        __init__.py
        urls.py
        pages.py
        form_receivers.py
        models.py
        forms.py
        admin.py
        emailer.py

        templates/
            base.html
            <html template files>

        static/
            reset.css
            bootstrap.css
            style.css
            ajaxify.js
            jslibs/
                backbone.js
                underscore.js
                bootstrap.min.js
