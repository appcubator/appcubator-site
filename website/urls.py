from django.conf.urls import patterns, include, url
from django.conf import settings
import django.contrib.auth.views
import views

urlpatterns = patterns('views',
    url(r'^$',                          views.homepage),

    url(r'^500/$',                          views.five_hundred_test),
    url(r'^404/$',                          views.five_hundred_test, {"code":404}),

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

    url(r'^send_invitation/(\d+)/$',    views.send_invitation_to_customer),

    url(r'^resources/$',                                           views.resources),
    url(r'^resources/editor/$',                                    views.external_editor),
    url(r'^app/0/editor/0/$',                                      views.external_editor_iframe),
    url(r'^resources/editor/publish/$',                            views.temp_deploy),
    url(r'^resources/quickstart/$',                                views.quickstart),
    url(r'^resources/tutorials/$',                                 views.tutorials),
    url(r'^resources/docs/$',                                      views.documentation),
    url(r'^resources/screencast/(\d+)/$',                          views.screencast), # these are the editor videos

    url(r'^resources/tutorials/build-social-network/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'howtosocialnetwork'}),
    url(r'^resources/tutorials/deploy-to-cloud/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'deploy-to-cloud'}),
    url(r'^resources/tutorials/get-it-running/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'get-it-running'}),
    url(r'^resources/tutorials/custom-code/(?:[\w\-]+/)?(?:[\w\-]+/)?$', views.resources_socialnetwork, {'name':'custom-code'}),
    url(r'^resources/tutorials/what-is-a-web-app/$',                views.resources_whatisawebapp),
    url(r'^resources/tutorials/appcubator-for-django-developers/$', views.resources_fordjangodevs),
    url(r'^resources/tutorials/custom-widget/$', views.resources_customwidget),

    url(r'^resources/sample/(\d+)/$',                              views.sample_app),
    url(r'^resources/sample/(\d+)/part/(\d+)/$',                   views.sample_app_part),

    url(r'^resources/designer-guide/$',                            views.designer_guide),
    url(r'^resources/designer-guide-old/$',                        views.designer_guide_old),
    url(r'^resources/developer-guide/$',                           views.developer_guide),
    url(r'^suggestions/$',                                         views.suggestions),
    url(r'^toggle/$',                                              views.toggle_love),
    # url(r'^articles/comments/',                                    include('django.contrib.comments.urls')),
    url(r'^comments/',                                             include('django.contrib.comments.urls')),
)
