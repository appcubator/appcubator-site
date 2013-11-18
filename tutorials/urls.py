from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import views

urlpatterns = patterns('views',

    url(r'^tutorials/', views.tutorials_page),
    url(r'^tutorials/(\d+)/', views.tutorial),

)
