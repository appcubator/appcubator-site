from django.conf.urls import patterns, include, url

urlpatterns = patterns('appcubator.themes.views',
    url(r'^new/web/$', 'new_web'),
    url(r'^new/mobile/$', 'new_mobile'),
    url(r'^(\d+)/info/$', 'info'),
    url(r'^(\d+)/settings/$', 'settings'),
    url(r'^(\d+)/edit/$', 'edit'),
    url(r'^(\d+)/edit_image/$', 'image_edit'),
    url(r'^(\d+)/clone/$', 'clone'),
    url(r'^(\d+)/delete/$', 'delete'),
    url(r'^(\d+)/editor/(\d+)$', 'page_editor'),
    # GET returns the apps statics, POST creates a new static file entry,
    # DELETE delete a static file
    url(r'^(\d+)/static/(\d+)$', 'deletethemestaticfile'),
    url(r'^(\d+)/static/$', 'themestaticfiles'),

    url(r'^(\d+)/', 'show'),
)
