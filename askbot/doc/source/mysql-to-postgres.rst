.. _mysql-to-postgres:

===========================================================
Migrating data from MySQL to Postgresql
===========================================================

In this document we explain how to migrate from MySQL to Postgresql with different approaches.

Askbot is optimized for Postgresql as search functionality works better with this database engine.

.. note::
    As a general advice and to reduce the database size run the **clearsessions** management command before starting the migration.


Simple Migration of small database
==================================

If your database is small with few users and questions you can follow this steps:

With MySQL as your database engine in your settings.py file run the following command::

    python manage.py dumpdata > data.json

After that change your database engine to Postgresql in settings.py and do::

    python manage.py loaddata  data.json


.. note::
    This wont work with large datasets because django will load all your data into memory and you might run out of memory if the site data is too large.


    This process can produce warnings that can be ignored.


    Please make sure that your postgres database is empty but with the askbot structure inside as after syncdb and migrate.


Data migration with py-mysql2pgsql
==================================

If the database is large this tool will come handy, to install it run::

    pip install py-mysql2pgsql

After it is installed create a configuration file called config.yml with the following contents::
    
    mysql:
      hostname: localhost
      port: 3306
      username: your_user 
      password: your_password 
      database: your_database 

    destination:
      file:
      postgres:
        hostname: localhost
        port: 5432
        username: your_user 
        password: your_password 
        database: your_database 

Then run::

    py-mysql2pgsql -v -f config.yml

It will start to migrate data, it might take a while acording to the database size.

After that process is finished there are a couple of things left to do.


Enabling Postgresql full text search
------------------------------------

Askbot relies on special postgresql features for better search, in this case the py-mysql2pgsql tool will not 
add these features, so it requires to be added manually.

To fix it run the command::

    python manage.py init_postgresql_full_text_search

It may take a while according to your database size. Test this by running a search query on the askbot site.

..
    Download:
        1. `thread_and_post_models_10032013.plsql <https://raw.github.com/ASKBOT/askbot-devel/master/askbot/search/postgresql/thread_and_post_models_10032013.plsql>`_
        2. `user_profile_search_08312012.plsql <https://raw.github.com/ASKBOT/askbot-devel/master/askbot/search/postgresql/user_profile_search_08312012.plsql>`_
        And apply them to your postgres database like this::
            psql your_database < thread_and_post_models_10032013.plsql
            psql your_database < user_profile_search_08312012.plsql


Fixing data types
-----------------

The py-mysql2pgsql translates datatype a bit different than Django ORM do, to keep the same 
datatypes do the following:

1. Create a new postgresql database and run sync and migrate commands the following way::

    python manage.py syncdb --migrate --noinput --no-initial-data

2. Dump the converted database data with binary format::

    pg_dump --format=c -a database_name > dump_name 

3. Restore it into your current Django database::

    pg_restore -a --disable-triggers -d django_database dump_name 


Links
=====

* `py-mysql2pgsql <https://github.com/philipsoutham/py-mysql2pgsql>`_
