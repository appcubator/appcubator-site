from django.conf.urls import patterns, include, url
import views

urlpatterns = patterns('',
  url(r'^test/$', views.test),
  url(r'^validate/$', views.validate),

)
