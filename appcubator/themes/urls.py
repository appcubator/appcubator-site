from django.conf.urls import patterns, include, url

urlpatterns = patterns('appcubator.themes.views',
    url(r'^theme/new/web/$', 'new_web'),
    url(r'^theme/new/mobile/$', 'new_mobile'),
    url(r'^theme/(\d+)/info/$', 'info'),
    url(r'^theme/(\d+)/settings/$', 'settings'),
    url(r'^theme/(\d+)/edit/$', 'edit'),
    url(r'^theme/(\d+)/edit_image/$', 'image_edit'),
    url(r'^theme/(\d+)/clone/$', 'clone'),
    url(r'^theme/(\d+)/delete/$', 'delete'),
    url(r'^theme/(\d+)/editor/(\d+)$', 'page_editor'),
    # GET returns the apps statics, POST creates a new static file entry,
    # DELETE delete a static file
    url(r'^theme/(\d+)/static/(\d+)$', 'deletethemestaticfile'),
    url(r'^theme/(\d+)/static/$', 'themestaticfiles'),

    url(r'^theme/(\d+)/', 'show'),
)
