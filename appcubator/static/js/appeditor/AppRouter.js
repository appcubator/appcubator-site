define(function(require, exports, module) {
    'use strict';

    var SimpleModalView = require("mixins/SimpleModalView");
    var ErrorDialogueView = require("mixins/ErrorDialogueView");
    var SimpleDialogueView = require("mixins/SimpleDialogueView");

    var TutorialView = require("tutorial/TutorialView"),
        AppView = require("app/AppView"),
        DeployView = require("app/DeployView"),
        AccountDropdownView = require("app/AccountDropdownView"),
        Striper = require('app/Striper'),
        DashboardsView = require('app/DashboardsView');

    var AppRouter = Backbone.Router.extend({

        routes: {
            "app/new/"                     : "newapp",
            "app/:appid/info/*tutorial"    : "info",
            "app/:appid/tables/*tutorial"  : "tables",
            "app/:appid/gallery/*tutorial" : "themes",
            "app/:appid/template/:pageid/" : "appmain",
            "app/:appid/plugins/*tutorial" : "plugins",
            "app/:appid/mobile-editor/:pageid/": "mobileEditor",
            "app/:appid/emails/*tutorial"  : "emails",
            "app/:appid/*tutorial"         : "appmain",
            "app/:appid/*anything/"        : "appmain",
            "account"                      : "accountPage",
        },

        tutorialPage: 0,

        initialize: function() {
            var self = this;
            v1.view = null;

            _.bindAll(this);

            this.route(username +"/", "dashboard", v1.dashboard);

            $('#tutorial').on('click', function(e) {
                self.showTutorial();
                window.history.pushState(null, null, window.location.href.concat("tutorial/"));
            });

            var accountDropdownView = new AccountDropdownView();
            accountDropdownView.setElement($('.account-dropdown-menu')).render();
            accountDropdownView.setToggleEl($('.account-menu-toggle'));

            this.currentApp = null;
        },

        configApp: function() {
            if(this.currentApp) return;

            this.currentApp = new AppView({
                model: v1State,
                appId: appId
            });
            v1.view = this.currentApp;
        },

        shrinkDropdowns: function () {
            $(window).trigger("mouseup");
        },

        info: function (appId, tutorial) {
            v1.configApp();
            var self = this;
            v1.currentApp.info(tutorial);
        },

        tables: function (appId, tutorial) {
            v1.configApp();
            v1.currentApp.tables(tutorial);
        },

        themes: function (appId, tutorial) {
            v1.configApp();
            v1.currentApp.themes(tutorial);
        },

        pages: function(appId, tutorial) {
            v1.configApp();
            v1.currentApp.pages(tutorial);
        },

        appmain: function(appId, pageId) {
            v1.configApp();
            if (!pageId) pageId = 0;
            v1.currentApp.pageWithIndex(pageId);
        },

        emails: function(appId, tutorial) {
            v1.configApp();
            v1.currentApp.emails(tutorial);
        },

        plugins: function(appId, tutorial) {
            v1.configApp();
            //v1.currentApp.plugins(tutorial);
        },

        showTutorial: function(dir) {
            var inp = (dir) ? dir : this.tutorialPage;
            if (this.tutorialIsVisible) {
                this.tutorial.chooseSlide(inp);
            } else {
                this.tutorial = new TutorialView({
                    initial: inp
                });
                this.tutorialIsVisible = true;
            }
        },

        accountPage: function() {
            var PaymentsMain = function() {
                var striper = new Striper();
                striper.bindChangeCard('.change-card', 'change-card-form');
                striper.onSuccess = function() {
                    window.location = "/account/";
                };

                // striper.bindChangePlan('#change-plan-btn','change-subscription');
                striper.bindCancel('#cancel-btn', 'cancel-form');
            };

            $(document).ready(new PaymentsMain());


            this.$nav = $('.navigator .left-nav');

            // make left nav links scroll page
            this.$nav.find('a').click(function() {
                var elem = this.getAttribute('href');
                var topPos = $(elem).offset().top - 75;
                $('html,body').animate({
                    scrollTop: topPos
                });
                return false;
            });

            $('.left-nav').affix({
                offset: 0
            });

            $('#add-key-btn').on('click', function() {
                $('#add-key-btn').hide();
                $('#add-key-panel').fadeIn();
            });

            // @ksikka's code
            $(document).ready(function() {
                $('form').not('.no-ajax').each(function(ind, node) {
                    $(node).submit(function(e) {
                        var self = this;
                        var ajax_info = {
                            type: $(node).attr('method'),
                            url: $(node).attr('action'),
                            data: $(node).serialize(),
                            success: function(data, statusStr, xhr) {
                                if (typeof(data.redirect_to) !== 'undefined') {
                                    location.href = data.redirect_to;
                                } else {
                                    _.each(data, function(val, key, ind) {
                                        if (key === '__all__') {
                                            $(self).find('.form-error.field-all').html(val.join('<br />')).show();
                                        } else {
                                            $(self).find('.form-error.field-name-' + key).html(val.join('<br />')).show();
                                        }
                                    });
                                }
                            }
                        };
                        $.ajax(ajax_info);
                        $(self).find('.form-error').html("");
                        return false;
                    });
                });
            });
        },

        newapp: function() {

            $('#skip-racoon').hover(function() {
                $('#mascot').addClass('happy');
            }, function() {
                $('#mascot').removeClass('happy');
            });

        },

        dashboard: function() {
            console.log("DASHBOARD");

            var dboard = new DashboardsView();

            $( document ).tooltip({
              position: {
                my: "center bottom-10",
                at: "center top",
                using: function( position, feedback ) {
                  $( this ).css( position );
                  $( "<div>" )
                    .addClass( "arrow" )
                    .addClass( feedback.vertical )
                    .addClass( feedback.horizontal )
                    .appendTo( this );
                }
              }
            });

        },

        changeTitle: function(title) {
            var newTitle = "";
            if (title) {
                newTitle = " | " + title;
            }
            document.title = "Appcubator" + newTitle;
        }

    });

    return AppRouter;

});
