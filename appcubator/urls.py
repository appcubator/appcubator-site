from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import views, theme_views, log_views, test_views, admin_views
import django.views.generic.base
from django.views.generic.simple import direct_to_template
from appcubator_payments import views as payment_views
import website
from django.contrib import admin

urlpatterns = patterns('',
    url(r'^forum/', include('askbot.urls')),
    # url(r'^admin/', include(admin.site.urls)),
)

urlpatterns += patterns('',
    url(r'^', include('website.urls')),
    url(r'^backend/',                   include('app_builder.urls')),
    url(r'^payments/',                  include('appcubator.appcubator_payments.urls')),
    url(r'^app/(\d+)/payment/$',        payment_views.app_payment),
    url(r'^trigger_customer/$',         payment_views.stripe_acc_trigger),
)

urlpatterns += patterns('appcubator.log_views',
    url(r'^log/feedback/$', 'log_feedback'),
    url(r'^log/anything/$', 'log_anything'),
)

urlpatterns += patterns('appcubator.views',
    url(r'filepick', django.views.generic.base.TemplateView.as_view(template_name="dev/filepicker-test.html")),

    url(r'^app/$', 'app_welcome'),
    url(r'^app/(\d+)/', 'app_dashboard'),
    url(r'^app/0/$', 'app_noob_page'),
    url(r'^app/new/$', 'app_new'),
    url(r'^app/new/template/(\w+)/$', 'app_new_template'),
    url(r'^app/new/walkthrough/simple/$', 'app_new_walkthrough', {"walkthrough": 'simpleWalkthrough'}),
    url(r'^app/new/walkthrough/indepth/$', 'app_new_walkthrough', {"walkthrough": 'walkthrough'}),
    url(r'^app/(\d+)/delete/$', 'app_delete'),
    url(r'^app/(\d+)/edit_theme/', 'app_edit_theme'),
    url(r'^app/(\d+)/themeeditor/', 'app_edit_theme'),

    # analytics
    url(r'^app/(\d+)/analytics/$', 'get_analytics'),

    # statix
    url(r'^app/(\d+)/static/$',              'staticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
    url(r'^app/(\d+)/static/(\d+)/delete/$', 'delete_static'), 

    # getting/setting state
    url(r'^app/(\d+)/state/$', 'app_state'),
    url(r'^app/(\d+)/state/force/$', 'app_state', {"validate": False}),
    url(r'^app/(\d+)/clone/$', 'app_clone'),

    # getting/setting uie state
    url(r'^app/(\d+)/uiestate/$', 'uie_state'),
    url(r'^app/(\d+)/mobile_uiestate/$', 'mobile_uie_state'),

    url(r'^app/(\d+)/uiestate.less$', 'less_sheet'),
    url(r'^app/(\d+)/uiestate.css$', 'css_sheet'),
    url(r'^app/(\d+)/mobile_uiestate.less$', 'mobile_less_sheet'),
    url(r'^app/(\d+)/mobile_uiestate.css$', 'mobile_css_sheet'),

    # deploy
    url(r'^app/(\d+)/deploy/$',        'app_deploy'),

    #zip
    url(r'^app/(\d+)/zip/$', 'app_zip'),

    #invitations
    url(r'^app/(\d+)/invitations/$', 'invitations'),

    # domains
    url(r'^app/(\d+)/customdomain/(.*)/$', 'hookup_custom_domain'),
        # this is old stuff
    url(r'^domains/(.*)/available_check/$', 'check_availability'),
    url(r'^domains/(.*)/register/$', 'register_domain'),
    # subdomains
    url(r'^subdomains/(.*)/available_check/$', 'sub_check_availability'),
    url(r'^app/(\d+)/subdomain/(.*)/$', 'sub_register_domain'),

    # special json editor route
    url(r'^app/(\d+)/editor/\d+/debug/$', 'app_json_editor'), # this serves all the app pages

    url(r'^feedback/$', 'documentation_page', {"page_name": "feedback"}),
    url(r'^documentation/$', 'documentation_page', {"page_name": "all"}),
    url(r'^documentation/search/$', 'documentation_search'),
    url(r'^documentation/([^/]+)/$', 'documentation_page'),
    url(r'^resources/documentation/$', 'documentation_page', {"page_name": "all"}),

    url(r'^', include('appcubator.plugins.urls')),

    # the rest
    url(r'^app/(\d+)/', 'app_page', {"page_name": "overview"}), # this serves all the app pages
    url(r'^app/(\d+)/([^/]+)/$', 'app_page'), # this serves all the app pages

    url(r'^sendhostedemail/$', 'send_hosted_email'),

)

urlpatterns += patterns('appcubator.admin_views',
    url(r'^stay/up/to/get/lucky/$', 'admin_home'),
    url(r'^stay/up/to/get/lucky/customers/$', 'admin_customers'),
    url(r'^stay/up/to/get/lucky/customers/(\d+)/add_contact_log/$', 'admin_add_contactlog'),
    url(r'^stay/up/to/get/lucky/search/$', 'admin_customers_search'),
    url(r'^stay/up/to/get/lucky/users/(\d+)$', 'admin_user'),
    url(r'^stay/up/to/get/lucky/users/(\d+)/graph/$', 'user_logs_graph'),
    url(r'^stay/up/to/get/lucky/users/$', 'admin_users'),
    url(r'^stay/up/to/get/lucky/apps/errors/$', 'admin_app_errors'),
    url(r'^stay/up/to/get/lucky/apps/(\d+)$', 'admin_app'),
    url(r'^stay/up/to/get/lucky/apps/(\d+)/snaps$', 'admin_app_snaps'),
    url(r'^stay/up/to/get/lucky/apps/$', 'admin_apps'),
    url(r'^stay/up/to/get/lucky/invitations/$', 'admin_invitations'),
    url(r'^stay/up/to/get/lucky/feedback/$', 'admin_feedback'),
    url(r'^stay/up/to/get/lucky/walkthroughs/$', 'admin_walkthroughs'),
    url(r'^stay/up/to/get/lucky/usersbydate/$', 'user_signups_json'),
    url(r'^stay/up/to/get/lucky/data/(\d+)/(\d+)/([^/]+)/$', 'active_users_json'),
    url(r'^stay/up/to/get/lucky/logs/$', 'logs'),

)

urlpatterns += patterns('appcubator.theme_views',
    url(r'^designer/$', 'designer_page'),
    url(r'^theme/new/web/$', 'theme_new_web'),
    url(r'^theme/new/mobile/$', 'theme_new_mobile'),
    url(r'^theme/(\d+)/info/$', 'theme_info'),
    url(r'^theme/(\d+)/settings/$', 'theme_settings'),
    url(r'^theme/(\d+)/edit/$', 'theme_edit'),
    url(r'^theme/(\d+)/edit_image/$', 'theme_image_edit'),
    url(r'^theme/(\d+)/clone/$', 'theme_clone'),
    url(r'^theme/(\d+)/delete/$', 'theme_delete'),
    url(r'^theme/(\d+)/editor/(\d+)$', 'theme_page_editor'),
    # GET returns the apps statics, POST creates a new static file entry,
    # DELETE delete a static file
    url(r'^theme/(\d+)/static/(\d+)$', 'deletethemestaticfile'),
    url(r'^theme/(\d+)/static/$', 'themestaticfiles'),

    url(r'^theme/(\d+)/', 'theme_show'),
)

urlpatterns += patterns('appcubator.test_views',
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

# production (hosted) deployments
"""
if settings.PRODUCTION:
  urlpatterns += patterns('deployment.views',
      url(r'^deployment/$', 'list_deployments'), # list the deployments and their statuses
      url(r'^deployment/available_check/$', 'available_check'), # check if the domain is available
      url(r'^deployment/push/$', 'deploy_code'), # push the new code into the directory
      url(r'^deployment/delete/$', 'delete_deployment'), # push the new code into the directory
  )
  """

from django.contrib.staticfiles.urls import staticfiles_urlpatterns

urlpatterns += staticfiles_urlpatterns()
