from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import base_views, views, theme_views, log_views, test_views, admin_views
import django.views.generic.base
from django.views.generic.simple import direct_to_template
from registration.backends.default.views import RegistrationView, ActivationView
from payments import views as payment_views
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    url(r'^$',                          base_views.homepage),
    url(r'^showhn/$',                   base_views.showhnpage),
    url(r'^aboutus/$',                  base_views.aboutus),
    # Signup, Login and invites
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^login/$',                    django.contrib.auth.views.login, {'template_name' : 'registration/login_page.html'}),
    url(r'^logout/$',                   django.contrib.auth.views.logout, {"next_page":"/"}),
    url(r'^connect_with/$',             base_views.get_linkedin),
    url(r'^signup/$',                   base_views.signup),
    url(r'^termsofservice/$',           base_views.terms_of_service),
    url(r'^faq/$',                      base_views.faq),
    url(r'^account/$',                  base_views.account),
    url(r'^ping/$',                     base_views.ping),
    url(r'^whatisthis/$',               base_views.marketing),
    url(r'^signup_form/$',              base_views.signup_new_customer),
    url(r'^signup_hn_form/$',           base_views.signup_hn_customer),
    url(r'^send_invitation/(\d+)/$',    base_views.send_invitation_to_customer),
    url(r'^backend/',                   include('app_builder.urls')),
    url(r'^payments/',                  include('appcubator.payments.urls')),
    url(r'^app/(\d+)/payment/$',       payment_views.app_payment)
)

urlpatterns += patterns('appcubator.log_views',
    url(r'^app/(\d+)/log/routes/$', 'log_route'),
    url(r'^log/slide/$', 'log_slide'),
    url(r'^log/feedback/$', 'log_feedback'),
    url(r'^log/anything/$', 'log_anything'),
)

urlpatterns += patterns('appcubator.views',
    url(r'filepick', django.views.generic.base.TemplateView.as_view(template_name="dev/filepicker-test.html")),

    url(r'^app/$', 'app_welcome'),
    url(r'^app/0/$', 'app_noob_page'),
    url(r'^app/new/$', 'app_new'),
    url(r'^app/new/racoon$', 'app_new', {"is_racoon": True}),
    url(r'^app/new/walkthrough/simple/$', 'app_new_walkthrough', {"walkthrough": 'simpleWalkthrough'}),
    url(r'^app/new/walkthrough/indepth/$', 'app_new_walkthrough', {"walkthrough": 'walkthrough'}),
    url(r'^app/(\d+)/racoon/$', 'app_new_racoon'),
    url(r'^app/(\d+)/delete/$', 'app_delete'),
    url(r'^app/(\d+)/edit_theme/$', 'app_edit_theme'),

    # analytics
    url(r'^app/(\d+)/analytics/$', 'get_analytics'),

    # entities
    url(r'^app/(\d+)/entities/xl/$', 'process_excel'),
    url(r'^app/(\d+)/entities/userxl/$', 'process_user_excel'),

    # statix
    url(r'^app/(\d+)/static/$', 'staticfiles'), # a GET returns the apps statics, a POST creates a static file entry.

    # getting/setting state
    url(r'^app/(\d+)/state/$', 'app_state'),
    url(r'^app/(\d+)/state/force/$', 'app_state', {"validate": False}),

    # getting/setting uie state
    url(r'^app/(\d+)/uiestate/$', 'uie_state'),
    url(r'^app/(\d+)/mobile_uiestate/$', 'mobile_uie_state'),

    url(r'^app/(\d+)/uiestate.less$', 'less_sheet'),
    url(r'^app/(\d+)/uiestate.css$', 'css_sheet'),
    url(r'^app/(\d+)/mobile_uiestate.less$', 'mobile_less_sheet'),
    url(r'^app/(\d+)/mobile_uiestate.css$', 'mobile_css_sheet'),

    # deploy
    url(r'^app/(\d+)/deploy/$', 'app_deploy'),

    #zip
    url(r'^app/(\d+)/zip/$', 'app_zip'),

    # domains
    url(r'^domains/(.*)/available_check/$', 'check_availability'),
    url(r'^domains/(.*)/register/$', 'register_domain'),
    # subdomains
    url(r'^subdomains/(.*)/available_check/$', 'sub_check_availability'),
    url(r'^app/(\d+)/subdomain/(.*)/$', 'sub_register_domain'),

    # special json editor route
    url(r'^app/(\d+)/editor/\d+/debug/$', 'app_json_editor'), # this serves all the app pages

    url(r'^feedback/$', 'documentation_page', {"page_name": "feedback"}),
    url(r'^documentation/$', 'documentation_page', {"page_name": "intro"}),
    url(r'^documentation/([^/]+)/$', 'documentation_page'),

    # the rest
    url(r'^app/(\d+)/', 'app_page'), # this serves all the app pages

    url(r'^sendhostedemail/$', 'send_hosted_email'),
    url(r'^yomomma/(\d+)/$', 'yomomma'),
)

urlpatterns += patterns('appcubator.admin_views',
    url(r'^stay/up/to/get/lucky/$', 'admin_home'),
    url(r'^stay/up/to/get/lucky/customers/$', 'admin_customers'),
    url(r'^stay/up/to/get/lucky/users/(\d+)$', 'admin_user'),
    url(r'^stay/up/to/get/lucky/users/$', 'admin_users'),
    url(r'^stay/up/to/get/lucky/apps/(\d+)$', 'admin_app'),
    url(r'^stay/up/to/get/lucky/apps/$', 'admin_apps'),
    url(r'^stay/up/to/get/lucky/feedback/$', 'admin_feedback'),
)

urlpatterns += patterns('appcubator.theme_views',
    url(r'^designer/$', 'designer_page'),
    url(r'^theme/new/web/$', 'theme_new_web'),
    url(r'^theme/new/mobile/$', 'theme_new_mobile'),
    url(r'^theme/(\d+)/$', 'theme_show'),
    url(r'^theme/(\d+)/info/$', 'theme_info'),
    url(r'^theme/(\d+)/settings/$', 'theme_settings'),
    url(r'^theme/(\d+)/edit/$', 'theme_edit'),
    url(r'^theme/(\d+)/edit_image/$', 'theme_image_edit'),
    url(r'^theme/(\d+)/clone/$', 'theme_clone'),
    url(r'^theme/(\d+)/delete/$', 'theme_delete'),
    url(r'^theme/(\d+)/editor/(\d+)$', 'theme_page_editor'),
    url(r'^theme/(\d+)/static/$', 'themestaticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
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
