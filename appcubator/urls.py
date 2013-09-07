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
    url(r'^beta/$',                     base_views.homepage_new),
    url(r'^showhn/$',                   base_views.homepage),
    url(r'^showgsb/$',                  base_views.showgsbpage),
    url(r'^showdn/$',                   base_views.showdnpage),
    url(r'^girlswhocode/$',             base_views.showgwcpage),
    url(r'^developer/$',                base_views.developer_homepage),
    url(r'^community/$',                base_views.community_page),
    url(r'^community/faq/$',            base_views.community_faq_page),


    url(r'^aboutus/$',                  base_views.aboutus),
    url(r'^changelog/$',                base_views.changelog),
    # Signup, Login and invites
    url(r'^accounts/', include('registration.backends.default.urls')),
    url(r'^login/$',                    django.contrib.auth.views.login, {'template_name' : 'registration/login_page.html'}),
    url(r'^logout/$',                   django.contrib.auth.views.logout, {"next_page":"/"}),
    url(r'^connect_with/$',             base_views.get_linkedin),
    url(r'^termsofservice/$',           base_views.terms_of_service),
    url(r'^faq/$',                      base_views.faq),
    url(r'^account/$',                  base_views.account),
    url(r'^setpubkey/$',                base_views.setpubkey),
    url(r'^ping/$',                     base_views.ping),
    url(r'^csvusers/$',                 base_views.csvusers),
    url(r'^whatisthis/$',               base_views.marketing),

    # only creates beta invite
    url(r'^signup_form/$',              base_views.signup_new_customer),
    # actually signs up.
    url(r'^signup/$',                   base_views.signup, name='signup_form'),
    # actually signs up, stores source info
    url(r'^signup_hn_form/$',           base_views.signup_from_hn, name='hn_signup_form'),
    url(r'^signup_dn_form/$',           base_views.signup_from_dn, name='dn_signup_form'),
    url(r'^signup_gsb_form/$',          base_views.signup_from_gsb, name='gsb_signup_form'),
    url(r'^signup_gwc_form/$',          base_views.signup_from_gwc, name='gwc_signup_form'),

    url(r'^send_invitation/(\d+)/$',    base_views.send_invitation_to_customer),
    url(r'^backend/',                   include('app_builder.urls')),
    url(r'^payments/',                  include('appcubator.payments.urls')),
    url(r'^app/(\d+)/payment/$',        payment_views.app_payment),

    url(r'^resources/$',                                           base_views.resources),
    url(r'^resources/editor/$',                                    base_views.external_editor),
    url(r'^resources/quickstart/$',                                base_views.quickstart),
    url(r'^resources/tutorials/$',                                 base_views.tutorials),
    url(r'^resources/documentation/$',                             base_views.documentation),
    url(r'^resources/screencast/(\d+)/$',                          base_views.screencast),
    url(r'^resources/sample/(\d+)/$',                              base_views.sample_app),
    url(r'^resources/tutorial/build-social-network/(?:[\w\-]+/)?(?:[\w\-]+/)?$', base_views.resources_socialnetwork),
    url(r'^resources/tutorial/what-is-a-web-app/$',                base_views.resources_whatisawebapp),
    url(r'^resources/tutorial/appcubator-for-django-developers/$', base_views.resources_fordjangodevs),
    url(r'^resources/sample/(\d+)/part/(\d+)/$',                   base_views.sample_app_part),
    url(r'^resources/designer-guide/$',                            base_views.designer_guide),
    url(r'^resources/developer-guide/$',                           base_views.developer_guide),
)

urlpatterns += patterns('appcubator.log_views',
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
    url(r'^app/(\d+)/edit_theme/', 'app_edit_theme'),

    # analytics
    url(r'^app/(\d+)/analytics/$', 'get_analytics'),

    # statix
    url(r'^app/(\d+)/static/$',              'staticfiles'), # a GET returns the apps statics, a POST creates a static file entry.
    url(r'^app/(\d+)/static/(\d+)/delete/$', 'delete_static'), 

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
    url(r'^app/(\d+)/deploy/$',        'app_deploy'),

    #zip
    url(r'^app/(\d+)/zip/$', 'app_zip'),

    #invitations
    url(r'^app/(\d+)/invitations/$', 'invitations'),

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
    url(r'^documentation/search/$', 'documentation_search'),
    url(r'^documentation/([^/]+)/$', 'documentation_page'),

    # the rest
    url(r'^app/(\d+)/', 'app_page', {"page_name": "overview"}), # this serves all the app pages
    url(r'^app/(\d+)/([^/]+)/$', 'app_page'), # this serves all the app pages

    url(r'^sendhostedemail/$', 'send_hosted_email'),
)

urlpatterns += patterns('appcubator.admin_views',
    url(r'^stay/up/to/get/lucky/$', 'admin_home'),
    url(r'^stay/up/to/get/lucky/customers/$', 'admin_customers'),
    url(r'^stay/up/to/get/lucky/users/(\d+)$', 'admin_user'),
    url(r'^stay/up/to/get/lucky/users/(\d+)/graph/$', 'user_logs_graph'),
    url(r'^stay/up/to/get/lucky/users/$', 'admin_users'),
    url(r'^stay/up/to/get/lucky/apps/(\d+)$', 'admin_app'),
    url(r'^stay/up/to/get/lucky/apps/$', 'admin_apps'),
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
