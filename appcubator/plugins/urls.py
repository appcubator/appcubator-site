from django.conf.urls import patterns, include, url
import views

urlpatterns = patterns('',
    # 1/business_name/ for paypal
    url(r'^app/(\d+)/plugins/(\d+)/(\w+)/$', views.plugin_data),
)
