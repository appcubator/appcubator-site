from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import views

urlpatterns = patterns('views',
    url(r'^$',                          views.homepage),
    url(r'^showhn/$',                   views.homepage),
    url(r'^showgsb/$',                  views.showgsbpage),
    url(r'^showdn/$',                   views.showdnpage),
    url(r'^girlswhocode/$',             views.showgwcpage),
    url(r'^developer/$',                views.developer_homepage),
    url(r'^community/$',                views.community_page),
    url(r'^community/faq/$',            views.community_faq_page),


    url(r'^aboutus/$',                  views.aboutus),
    url(r'^changelog/$',                views.changelog),
    # Signup, Login and invites
    url(r'^accounts/', include('appcubator.registration_urls')),
    url(r'^login/$',                    django.contrib.auth.views.login, {'template_name' : 'registration/login_page.html'}),
    url(r'^logout/$',                   django.contrib.auth.views.logout, {"next_page":"/"}),
    url(r'^termsofservice/$',           views.terms_of_service),
    url(r'^faq/$',                      views.faq),
    url(r'^account/$',                  views.account),
    url(r'^setpubkey/$',                views.setpubkey),
    url(r'^ping/$',                     views.ping),
    url(r'^csvusers/$',                 views.csvusers),
    url(r'^whatisthis/$',               views.marketing),

    # only creates beta invite
    url(r'^signup_form/$',              views.signup_new_customer),
    # actually signs up.
    url(r'^signup/$',                   views.signup, name='signup_form'),
    # actually signs up, stores source info
    url(r'^signup_hn_form/$',           views.signup_from_hn, name='hn_signup_form'),
    url(r'^signup_dn_form/$',           views.signup_from_dn, name='dn_signup_form'),
    url(r'^signup_gsb_form/$',          views.signup_from_gsb, name='gsb_signup_form'),
    url(r'^signup_gwc_form/$',          views.signup_from_gwc, name='gwc_signup_form'),

    url(r'^send_invitation/(\d+)/$',    views.send_invitation_to_customer),

    url(r'^resources/$',                                           views.resources),
    url(r'^resources/editor/$',                                    views.external_editor),
    url(r'^resources/editor/publish/$',                            views.temp_deploy),
    url(r'^resources/quickstart/$',                                views.quickstart),
    url(r'^resources/tutorials/$',                                 views.tutorials),
    url(r'^resources/docs/$',                                      views.documentation),
    url(r'^resources/screencast/(\d+)/$',                          views.screencast), # these are the editor videos

    url(r'^resources/tutorial/build-social-network/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'howtosocialnetwork'}),
    url(r'^resources/tutorial/deploy-to-cloud/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'deploy-to-cloud'}),
    url(r'^resources/tutorial/get-it-running/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'get-it-running'}),
    url(r'^resources/tutorial/custom-code/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'custom-code'}),
    url(r'^resources/tutorial/what-is-a-web-app/$',                views.resources_whatisawebapp),
    url(r'^resources/tutorial/appcubator-for-django-developers/$', views.resources_fordjangodevs),
    url(r'^resources/tutorial/custom-widget/$', views.resources_customwidget),

    url(r'^resources/sample/(\d+)/$',                              views.sample_app),
    url(r'^resources/sample/(\d+)/part/(\d+)/$',                   views.sample_app_part),

    url(r'^resources/designer-guide/$',                            views.designer_guide),
    url(r'^resources/developer-guide/$',                           views.developer_guide),
    url(r'^suggestions/$',                                         views.suggestions),
    url(r'^toggle/$',                                              views.toggle_love),
    # url(r'^articles/comments/',                                    include('django.contrib.comments.urls')),
    url(r'^comments/',                                             include('django.contrib.comments.urls')),
)