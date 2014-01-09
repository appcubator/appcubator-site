define(function(require, exports, module) {
    'use strict';

    var SimpleModalView    = require("mixins/SimpleModalView");
    var ErrorDialogueView  = require("mixins/ErrorDialogueView");
    var SimpleDialogueView = require("mixins/SimpleDialogueView");

    var TutorialView  = require("tutorial/TutorialView"),
        AppView       = require("app/AppView"),
        DeployView    = require("app/DeployView"),
        AccountDropdownView = require("app/AccountDropdownView");

    var AppRouter = Backbone.Router.extend({

        routes: {
            "app/:appid/info/*tutorial"        : "info",
            "app/:appid/tables/*tutorial"      : "tables",
            "app/:appid/gallery/*tutorial"     : "themes",
            "app/:appid/pages/*tutorial"       : "pages",
            "app/:appid/page/:pageid/"         : "appmain",
            "app/:appid/plugins/*tutorial"     : "plugins",
            "app/:appid/mobile-editor/:pageid/": "mobileEditor",
            "app/:appid/emails/*tutorial"      : "emails",
            "app/:appid/*tutorial"             : "appmain",
            "app/:appid/*anything/"            : "appmain"
        },

        tutorialPage: 0,

        initialize: function() {
            var self = this;
            v1.view = null;

            _.bindAll(this);
    
            $('#tutorial').on('click', function(e) {
                self.showTutorial();
                window.history.pushState(null, null, window.location.href.concat("tutorial/"));
            });

            var accountDropdownView = new AccountDropdownView();
            accountDropdownView.setElement($('.account-dropdown-menu')).render();
            accountDropdownView.setToggleEl($('.account-icon'));

            this.currentApp = new AppView({model: v1State, appId: appId});
            v1.view = this.currentApp;
        },

        info: function(appId, tutorial) {
            var self = this;
            v1.currentApp.info(tutorial);
        },

        tables: function(appId, tutorial) {
            v1.currentApp.tables(tutorial);
        },

        themes: function(appId, tutorial) {
            v1.currentApp.themes(tutorial);
        },

        pages: function(appId, tutorial) {
            v1.currentApp.pages(tutorial);
        },

        appmain: function(appId, pageId) {
            if(!pageId) pageId = 0;
            v1.currentApp.page(pageId);
        },

        emails: function(appId, tutorial) {
            v1.currentApp.emails(tutorial);
        },

        plugins: function(appId, tutorial) {
            v1.currentApp.plugins(tutorial);
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
