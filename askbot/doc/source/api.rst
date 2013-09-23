==========
Askbot API
==========

Askbot has API to access forum data in read-only mode.
Current version of API is 1.

All data is returned in json format.

All urls start with `/api/v1/` and the following endpoints are available:

`/api/v1/info/`
---------------
Returns basic parameters of the site.

`/api/v1/users/`
----------------
Returns, count, number of pages and basic data for each user.

Optional parameters::
* page (<int> page number)
* sort (reputation|oldest|recent|name, default value - "reputation")

`/api/v1/users/<user_id>/`
--------------------------
Returns basic information about a given user.

`/api/v1/questions/`
--------------------
Returns information about all questions.

Optional parameters::

* author (<int> user id) 
* scope (all|unanswered), default "all"
* sort (age|activity|answers|votes|relevance)-(asc|desc) default - activity-desc
* tags - comma-separated list of tags, without spaces
* query - text search query, url escaped

.. note::
    "relevance" sorting is available only for postgresql database backend

`/api/v1/questions/<question_id>/`
----------------------------------
Returns data about individual question
