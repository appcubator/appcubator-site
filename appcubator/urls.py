from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import views
import django.views.generic.base
from django.views.generic.simple import direct_to_template

from our_payments import views as payment_views
import website

urlpatterns = patterns('',
    url(r'^', include('website.urls')),
    url(r'^', include('tutorials.urls')),
    url(r'^payments/',                  include('appcubator.our_payments.urls')),
    url(r'^app/(\d+)/payment/$',        payment_views.app_payment),
    url(r'^trigger_customer/$',         payment_views.stripe_acc_trigger),
)

urlpatterns += patterns('appcubator.views.our_logging',
    url(r'^log/feedback/$', 'log_feedback'),
    url(r'^log/anything/$', 'log_anything'),
)

urlpatterns += patterns('appcubator.views.admin',
    url(r'^stay/up/to/get/lucky/', include('appcubator.admin.urls')),
)

urlpatterns += patterns('appcubator.views.app',
    url(r'^app/$', 'welcome'),

    url(r'^app/0/$', 'noob_page'),
    url(r'^app/new/$', 'new'),
    url(r'^app/new/template/(\w+)/$', 'new_template'),
    url(r'^app/new/walkthrough/simple/$', 'new_walkthrough', {"walkthrough": 'simpleWalkthrough'}),
    url(r'^app/new/walkthrough/indepth/$', 'new_walkthrough', {"walkthrough": 'walkthrough'}),
    url(r'^app/(\d+)/delete/$', 'delete'),
    url(r'^app/(\d+)/edit_theme/', 'edit_theme'),
    url(r'^app/(\d+)/themeeditor/', 'edit_theme'),

    # analytics
    url(r'^app/(\d+)/analytics/$', 'get_analytics'),

    # statix
    url(r'^app/(\d+)/static/$',              'staticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
    url(r'^app/(\d+)/static/(\d+)/delete/$', 'delete_static'), 

    # getting/setting state
    url(r'^app/(\d+)/state/$', 'state'),
    url(r'^app/(\d+)/state/force/$', 'state', {"validate": False}),
    url(r'^app/(\d+)/clone/$', 'clone'),

    # getting/setting uie state
    url(r'^app/(\d+)/uiestate/$', 'uie_state'),
    url(r'^app/(\d+)/mobile_uiestate/$', 'mobile_uie_state'),

    url(r'^app/(\d+)/uiestate.less$', 'less_sheet'),
    url(r'^app/(\d+)/uiestate.css$', 'css_sheet'),
    url(r'^app/(\d+)/mobile_uiestate.less$', 'mobile_less_sheet'),
    url(r'^app/(\d+)/mobile_uiestate.css$', 'mobile_css_sheet'),

    # deploy
    url(r'^app/(\d+)/deploy/$',        'deploy'),

    #zip
    url(r'^app/(\d+)/zip/$', 'app_zip'),

    #invitations
    url(r'^app/(\d+)/invitations/$', 'invitations'),

    #collaborators
    url(r'^app/(\d+)/collaborator/$', 'add_or_remove_collaborators'),
    url(r'^app/(\d+)/collaborator/delete/$', 'add_or_remove_collaborators', {'method': 'DELETE'}),

    # domains
    url(r'^app/(\d+)/customdomain/(.*)/$', 'hookup_custom_domain'),
        # this is old stuff
    url(r'^domains/(.*)/available_check/$', 'check_availability'),
    url(r'^domains/(.*)/register/$', 'register_domain'),
    # subdomains
    url(r'^subdomains/(.*)/available_check/$', 'sub_check_availability'),
    url(r'^app/(\d+)/subdomain/(.*)/$', 'sub_register_domain'),


    url(r'^app/(\d+)/editor/\d+/$', 'app_editor_iframe'),

    # special json editor route
    url(r'^app/(\d+)/debug/$', 'jsoneditor'),

    url(r'^feedback/$', 'documentation_page', {"page_name": "feedback"}),
    url(r'^documentation/$', 'documentation_page', {"page_name": "all"}),
    url(r'^documentation/search/$', 'documentation_search'),
    url(r'^documentation/([^/]+)/$', 'documentation_page'),
    url(r'^resources/documentation/$', 'documentation_page', {"page_name": "all"}),

    url(r'^', include('appcubator.plugins.urls')),

    # the rest
    url(r'^app/(\d+)/', 'page'),

    #url(r'^app/(\d+)/', 'page', {"page_name": "overview"}), # this serves all the app pages
    #url(r'^app/(\d+)/([^/]+)/$', 'page'), # this serves all the app pages

    url(r'^theme/(\d+)/sheet.css$', 'theme_css_sheet'),
    url(r'^sendhostedemail/$', 'send_hosted_email'),

    # USERNAME ROUTE moved down to the bottom to avoid conflict w other routes

)

urlpatterns += patterns('appcubator.themes.views',
    url(r'^designer/$', 'designer_page'),
    url(r'^theme/', include('appcubator.themes.urls')),
)

urlpatterns += patterns('appcubator.views.test',
    url(r'^test/editor/$', 'test_editor'),
    url(r'^test/formeditor/$', 'test_formeditor'),
    url(r'^test/thirdparty/$', 'test_thirdpartyforms'),
    url(r'^test/tables/$', 'test_tables'),
    url(r'^test/router/$', 'test_router'),
    url(r'^test/data/$',   'test_data'),
    url(r'^test/run_tests/$', 'run_front_end_tests'),
)

urlpatterns += patterns('',
    url(r'^favicon\.ico$', 'django.views.generic.simple.redirect_to', {'url': '/static/img/favicon.ico'}),
)

# USERNAME ROUTE
urlpatterns += patterns('appcubator.views.app',
    url(r'^([^\/]*)/$', 'user_page')
)

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

# Let django serve statics.
urlpatterns += patterns('',
    url(r'^static/(?P<path>.*)$', 'django.views.static.serve', {'document_root': settings.STATIC_ROOT, 'show_indexes': False,})
)

