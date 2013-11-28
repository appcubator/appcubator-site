define(function(require, exports, module) {
    'use strict';

    var SimpleModalView    = require("mixins/SimpleModalView");
    var ErrorDialogueView  = require("mixins/ErrorDialogueView");
    var SimpleDialogueView = require("mixins/SimpleDialogueView");

    var TutorialView  = require("tutorial/TutorialView"),
        EmailsView    = require("app/emails/EmailsView"),
        PluginsView   = require("app/PluginsView"),
        DeployView    = require("app/DeployView"),
        SoftErrorView = require("app/SoftErrorView"),
        GarageView    = require("app/GarageView"),
        WorldView     = require("app/WorldView");

    var AppRouter = Backbone.Router.extend({

        routes: {
            "app/:appid/info/*tutorial"        : "info",
            "app/:appid/tables/*tutorial"      : "tables",
            "app/:appid/gallery/*tutorial"     : "themes",
            "app/:appid/pages/*tutorial"       : "pages",
            "app/:appid/page/:pageid/"        : "editor",
            "app/:appid/plugins/*tutorial"     : "plugins",
            "app/:appid/mobile-editor/:pageid/": "mobileEditor",
            "app/:appid/emails/*tutorial"      : "emails",
            "app/:appid/*tutorial"             : "editor",
            "app/:appid/*anything/"            : "editor"
        },

        tutorialPage: 0,

        initialize: function() {
            var self = this;
            v1.view = null;
            _.bindAll(this);
            $('#save').on('click', this.save);
            $('#tutorial').on('click', function(e) {
                self.showTutorial();
                window.history.pushState(null, null, window.location.href.concat("tutorial/"));
            });

            keyDispatcher.bindComb('meta+s', this.save);
            keyDispatcher.bindComb('ctrl+s', this.save);

            keyDispatcher.bindComb('meta+c', this.copy);
            keyDispatcher.bindComb('ctrl+c', this.copy);
            keyDispatcher.bindComb('meta+v', this.paste);
            keyDispatcher.bindComb('ctrl+v', this.paste);

            var autoSave = setInterval(this.save, 30000);

            this.worldView = new WorldView();

            // if(appId !== 0) {
            //     this.garageView = new GarageView();
            //     $('.garage-toggle').on('click', this.garageView.toggle);
            //     $('.garage-toggle').on('click', this.worldView.hide);
            //     $('.world-toggle').on('click', this.garageView.hide);
            // }

            $('.world-toggle').on('click', this.worldView.toggle);

            this.listenTo(v1State.get('tables'), 'add', this.entityAdded);

            this.autoAddLinksToNavbar();
        },

        entityAdded: function(entityModel) {
            var pageName = entityModel.get('name') + ' Page';
            var newPage = { name: pageName, url: { urlparts:[ pageName.replace(/ /g, '_'), '{{'+ entityModel.get('name') +'}}'] } };
            v1State.get('pages').push(newPage);
        },

        index: function(appId, tutorial) {
            var self = this;
            require(['app/OverviewPageView'], function(OverviewPageView) {
                self.tutorialPage = "Introduction";
                self.changePage(OverviewPageView, tutorial, function() {});
                olark('api.box.show');
            });
        },

        info: function(appId, tutorial) {
            var self = this;
            require(['app/AppInfoView'], function(InfoView) {
                self.tutorialPage = "Application Settings";
                self.changePage(InfoView, tutorial, function() {
                    $('.menu-app-info').addClass('active');
                });
                olark('api.box.show');
            });
        },

        tables: function(appId, tutorial) {
            var self = this;
            require(['app/entities/EntitiesView'], function(EntitiesView) {
                self.tutorialPage = "Tables Page";
                self.changePage(EntitiesView, tutorial, function() {
                    self.trigger('entities-loaded');
                    $('.menu-app-entities').addClass('active');
                });
                olark('api.box.show');
            });
        },

        themes: function(appId, tutorial) {
            var self = this;
            self.tutorialPage = "Themes";
            require(['app/ThemesGalleryView'], function(ThemesGalleryView) {
                self.changePage(ThemesGalleryView, tutorial, function() {
                    self.trigger('themes-loaded');
                    $('.menu-app-themes').addClass('active');
                });
                olark('api.box.show');
            });
        },

        pages: function(appId, tutorial) {
            var self = this;
            self.tutorialPage = "Pages";
            require(['app/pages/PagesView'], function(PagesView) {
                $('.page').fadeIn();
                self.changePage(PagesView, tutorial, function() {
                    self.trigger('pages-loaded');
                    $('.menu-app-pages').addClass('active');
                });
                olark('api.box.show');
            });
        },

        editor: function(appId, pageId) {
            if(!pageId) pageId = 0;

            console.log(pageId);

            var self = this;

            self.tutorialPage = "Editor";

            require(['editor/EditorView'], function(EditorView) {
                // $('.page:not(.container)').fadeOut();
                if (v1.view) {
                    v1.view.close();
                }
                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                var mainContainer = document.getElementById('main-container');
                mainContainer.appendChild(cleanDiv);
                $('.page').fadeIn();

                console.log(pageId);
                v1.view = new EditorView({
                    pageId: pageId
                });
                v1.view.setElement(cleanDiv).render();

                self.trigger('editor-loaded');

                olark('api.box.hide');
                self.changeTitle(v1.view.title);
            });
        },

        mobileEditor: function(appId, pageId) {
            var self = this;
            self.tutorialPage = "Editor";
            require(['m-editor/MobileEditorView'], function(MobileEditorView) {
                if (v1.view) v1.view.close();
                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                var mainContainer = document.getElementById('main-container');
                mainContainer.appendChild(cleanDiv);

                v1.view = new MobileEditorView({
                    pageId: pageId
                });
                v1.view.setElement(cleanDiv).render();

                olark('api.box.hide');
                self.changeTitle(v1.view.title);
            });
        },

        emails: function(appId, tutorial) {
            var self = this;
            self.tutorialPage = "Emails";
            this.changePage(EmailsView, tutorial, function() {
                $('.menu-app-emails').addClass('active');
            });
        },

        plugins: function(appId, tutorial) {
            var self = this;
            self.tutorialPage = "Plugins";
            this.changePage(PluginsView, tutorial, function() {
                $('.menu-app-plugins').addClass('active');
            });
        },

        changePage: function(newView, tutorial, post_render) {
            if (v1.view) v1.view.close();
            var cleanDiv = document.createElement('div');
            cleanDiv.className = "clean-div";
            var mainContainer = document.getElementById('main-container');
            mainContainer.appendChild(cleanDiv);

            v1.view = new newView();
            v1.view.setElement(cleanDiv).render();
            $('.active').removeClass('active');
            this.changeTitle(v1.view.title);
            $("html, body").animate({
                scrollTop: 0
            });
            $('.page').fadeIn();
            post_render.call();
            if (tutorial && tutorial === 'tutorial/') {
                this.showTutorial();
            } else if (tutorial) {
                // remove random ending string from url path
                this.navigate(window.location.pathname.replace(tutorial, ''), {
                    replace: true
                });
            } else {
                if (this.tutorialIsVisible) {
                    this.tutorial.closeModal();
                }
            }
        },

        deploy: function(callback, hold_on_callback) {
            if (v1.disableSave === true) return;
            var self = this;
            var isDeployed = false;
            var before_deploy = new Date().getTime(); // global, b/c accessed in an ajax handler
            v1.disableSave = true;

            var successHandler = function(data, callback){
                v1.whenDeployed(function() {
                    callback.call();
                    new DeployView(data);
                    util.log_to_server('deployed app', {
                        status: 'success',
                        deploy_time: data.deploy_time + " seconds"
                    }, appId);
                    self.trigger('deployed');
                });
                return data;
            };

            var jqxhrToJson = function(jqxhr){
                var data = {};
                try {
                    data = JSON.parse(jqxhr.responseText);
                } catch (e) {
                    data.errors = ["JSON response from server failed to parse", jqxhr.responseText];
                }
                return data;
            };

            var mergeConflictHandler = function(data){
                var text = "<h1>Merge Conflict</h1>";
                text += "\n<p>We tried to generate the code but we couldn't resolve a conflict between our code and your code.</p>";
                text += "\n<p>To fix this, please resolve the conflict and push a commit with your fix in <span class=\"branch\">master</span>.</p>";
                text += "\n<p>We stored the conflict details in <span class=\"branch\">" + data.branch + "</span>.</p>";
                text += "\n<div>";
                text += "\n  <h2>Affected files</h2>";
                text += "\n  <ol>";
                for (var i = 0; i < data.files.length; i++) {
                    text += "\n    <li class=\"file\">" + data.files[i] + "</li>";
                }
                text += "\n  </ol>";
                text += "\n<div>";

                var content = {
                    text: text
                };
                new SimpleModalView(content);
                util.log_to_server('deployed app', {
                    status: 'merge conflict',
                    deploy_time: data.deploy_time + " seconds",
                    message: data
                }, appId);
                return data;
            };

            // this is copy pasted from the save code. i dont know how to modularize these functions properly. ~ks
            var softErrorHandler = function(data) {
                v1State.set('version_id', data.version_id);
                v1.disableSave = true;
                new SoftErrorView({
                    text: data.message,
                    path: data.path
                }, function() {
                    v1.disableSave = false;
                });
                return data;
            };
            var hardErrorHandler = function(data){
                var content = {};
                if (DEBUG) content.text = data.responseText;
                else content.text = "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon.";
                new ErrorDialogueView(content);
                util.log_to_server('deployed app', {
                    status: 'FAILURE',
                    deploy_time: data.deploy_time + " seconds",
                    message: data.errors
                }, appId);
                return data;
            };

            // compose this w the other callbacks
            var completeCallback = function(data) {
                v1.disableSave = false;
                isDeployed = true;
                data.deploy_time = (new Date().getTime() - before_deploy) / 1000;
                return data;
            };

            $.ajax({
                type: "POST",
                url: '/app/' + appId + '/deploy/',
                statusCode: {
                    200: function(data){
                        data = completeCallback(data);
                        data = successHandler(data, callback);
                    },
                    400: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = completeCallback(data);
                        data = softErrorHandler(data);
                        data = callback(data);
                    },
                    409: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = completeCallback(data);
                        data = mergeConflictHandler(data);
                        data = callback(data);
                    },
                    500: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = completeCallback(data);
                        data = hardErrorHandler(data);
                        data = callback(data);
                    },
                },
                dataType: "JSON"
            });

            var holdOnTimer = setTimeout(function() {
                if (!isDeployed) hold_on_callback.call();
                clearTimeout(holdOnTimer);
            }, 10000);
        },

        download: function(callback) {
            var jqxhrToJson = function(jqxhr){
                var data = {};
                try {
                    data = JSON.parse(jqxhr.responseText);
                } catch (e) {
                    data.errors = ["JSON response from server failed to parse", jqxhr.responseText];
                }
                return data;
            };

            var mergeConflictHandler = function(data){
                var text = "<h1>Merge Conflict</h1>";
                text += "\n<p>We tried to generate the code but we couldn't resolve a conflict between our code and your code.</p>";
                text += "\n<p>To fix this, please resolve the conflict and push a commit with your fix in <span class=\"branch\">master</span>.</p>";
                text += "\n<p>We stored the conflict details in <span class=\"branch\">" + data.branch + "</span>.</p>";
                text += "\n<div>";
                text += "\n  <h2>Affected files</h2>";
                text += "\n  <ol>";
                for (var i = 0; i < data.files.length; i++) {
                    text += "\n    <li class=\"file\">" + data.files[i] + "</li>";
                }
                text += "\n  </ol>";
                text += "\n<div>";

                var content = {
                    text: text
                };
                new SimpleModalView(content);
                util.log_to_server('deployed app', {
                    status: 'merge conflict',
                    deploy_time: data.deploy_time + " seconds",
                    message: data
                }, appId);
                return data;
            };

            // this is copy pasted from the save code. i dont know how to modularize these functions properly. ~ks
            var softErrorHandler = function(data) {
                v1State.set('version_id', data.version_id);
                v1.disableSave = true;
                new SoftErrorView({
                    text: data.message,
                    path: data.path
                }, function() {
                    v1.disableSave = false;
                });
                return data;
            };

            var hardErrorHandler = function(data){
                var content = {};
                if (DEBUG) content.text = data.responseText;
                else content.text = "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon.";
                new ErrorDialogueView(content);
                util.log_to_server('deployed app', {
                    status: 'FAILURE',
                    deploy_time: data.deploy_time + " seconds",
                    message: data.errors
                }, appId);
                return data;
            };

            var downloadApp = function(callback) {
                var url =  '/app/' + appId + '/zip/';
                var hiddenIFrameID = 'hiddenDownloader',
                iframe = document.getElementById(hiddenIFrameID);
                if (iframe === null) {
                    iframe = document.createElement('iframe');
                    iframe.id = hiddenIFrameID;
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                }
                iframe.src = url;
                callback();
            };

            $.ajax({
                type: "GET",
                url: '/app/' + appId + '/zip/',
                statusCode: {
                    200: function(data){
                        util.log_to_server('code downloaded', {}, appId);
                        downloadApp(callback);
                    },
                    400: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = softErrorHandler(data);
                        data = callback(data);
                    },
                    409: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = mergeConflictHandler(data);
                        data = callback(data);
                    },
                    500: function(jqxhr){
                        var data = jqxhrToJson(jqxhr);
                        data = hardErrorHandler(data);
                        data = callback(data);
                    },
                },
                dataType: "JSON"
            });
        },

        save: function(e, callback) {
            if (v1.disableSave === true) return;
            if (appId === 0) return;

            $('#save-icon').attr('src', '/static/img/ajax-loader-white.gif');
            var $el = $('.menu-button.save');
            $el.fadeOut().html("<span>Saving...</span>").fadeIn();

            var self = this;
            appState = v1State.toJSON();

            var successHandler = function(data) {
                util.dontAskBeforeLeave();
                v1.disableSave = false;

                v1State.set('version_id', data.version_id);

                $('#save-icon').attr('src', '/static/img/checkmark.png').hide().fadeIn();
                var timer = setTimeout(function() {
                    $('#save-icon').attr('src', '/static/img/save.png').hide().fadeIn();
                    clearTimeout(timer);
                }, 1000);
                $('.menu-button.save').html("<span>Saved</span>").fadeIn();

                if ((typeof(callback) !== 'undefined') && (typeof(callback) == 'function')) {
                    callback();
                }

                var timer2 = setTimeout(function() {
                    $el.html("<span>Save</span>").fadeIn();
                    clearTimeout(timer2);
                }, 3000);
            };
            var softErrorHandler = function(jqxhr) {
                var data = JSON.parse(jqxhr.responseText);
                v1State.set('version_id', data.version_id);
                v1.disableSave = true;
                new SoftErrorView({
                    text: data.message,
                    path: data.path
                }, function() {
                    v1.disableSave = false;
                });
            };
            var browserConflictHandler = function(jqxhr) {
                v1.disableSave = true;
                var content = {
                    text: "Looks like you (or someone else) made a change to your app in another browser window. Please make sure you only use one window with Appcubator or you may end up overwriting your app with an older version. Please refresh the browser to get the updated version of your app."
                };
                if (BROWSER_VERSION_ERROR_HAPPENED_BEFORE) {
                    content.text += '<br><br><br>Refreshing in <span id="countdown-ksikka">6</span> seconds...\n'
                }
                var errorModal = new ErrorDialogueView(content, function() {
                    v1.disableSave = false;
                });
                if (BROWSER_VERSION_ERROR_HAPPENED_BEFORE) {
                    errorModal._countdownToRefresh();
                }
                // global
                BROWSER_VERSION_ERROR_HAPPENED_BEFORE = true;
            };
            var hardErrorHandler = function(jqxhr) {
                v1.disableSave = true;
                var content = {};
                if (DEBUG)
                    content = {
                        text: jqxhr.responseText
                    };
                else
                    content = {
                        text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon."
                    };
                new ErrorDialogueView(content, function() {
                    v1.disableSave = false;
                });
            };

            // for now, no difference
            var notFoundHandler = hardErrorHandler;
            v1.disableSave = true;

            $.ajax({
                type: "POST",
                url: '/app/' + appId + '/state/',
                data: JSON.stringify(appState),
                statusCode: {
                    200: successHandler,
                    400: softErrorHandler,
                    409: browserConflictHandler,
                    500: hardErrorHandler,
                    404: notFoundHandler,
                },
                dataType: "JSON"
            });

            if (e) e.preventDefault();
            return false;
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
        },

        copy: function(e) {
            if (keyDispatcher.textEditing === true) return;
            if (this.view.marqueeView.multiSelectorView.contents.length) {
                this.contents = [];
                _(this.view.marqueeView.multiSelectorView.contents).each(function(model) {
                    this.contents.push(_.clone(model.toJSON()));
                }, this);
            } else if (this.view.widgetsManager.widgetSelectorView.selectedEl) {
                this.contents = [];
                this.contents.push(_.clone(this.view.widgetsManager.widgetSelectorView.selectedEl.toJSON()));
            }
        },

        paste: function(e) {
            if (keyDispatcher.textEditing === true) return;
            if (!this.contents) return;

            _(this.contents).each(function(cont) {
                cont.layout.left++;
                cont.layout.top++;
                cont.layout.top++;
            });

            if (this.view.widgetsCollection) {
                var coll = this.view.widgetsCollection.add(_.clone(this.contents));
                if (this.contents.length == 1) {
                    coll.last(function(widgetModel){ widgetModel.trigger('selected'); });
                }
                else if (this.contents.length > 1) {
                    var newContents = coll.last(this.contents.length);
                    this.view.marqueeView.multiSelectorView.setContents(newContents);
                }
            }
        },

        getDeploymentStatus: function(successCallback, failCallback) {
            $.ajax({
                type: "GET",
                url: '/app/' + appId + '/deploy/',
                success: function(data) {
                    if(data.status !== undefined) {
                        if (data.status === 0) {
                            // I'll need to figure out a better way soon.
                            // new ErrorDialogueView({text: 'Something is wrong... deployment seems to not have gotten the memo.'});
                        }
                        else if (data.status == 1) {
                            failCallback.call(); // deployment task is still running
                        }
                        else if (data.status == 2) {
                            successCallback.call();
                        }
                        else {
                            new ErrorDialogueView({text: 'Deploy status route returned a bad value.'});
                        }
                    }
                    else {
                        alert('Deploy status route returned a bad value.');
                    }
                },
                dataType: "JSON"
            });
        },

        whenDeployed: function(successCallback) {
            v1.getDeploymentStatus(successCallback, function() {
                setTimeout(function() { v1.whenDeployed(successCallback); }, 1500);
            });
        },

        showGarage: function() {
            this.garageView.show();
            olark('api.box.show');
        },


        autoAddLinksToNavbar: function() {
          this.listenTo(v1State.get('pages'), 'add', function(pageM) {
            if(!pageM.isContextFree()) return;
            var homePageNav = v1State.get('pages').first().get('navbar');
            homePageNav.get('links').push({
                url  : 'internal://' + pageM.get('name'),
                title: pageM.get('name')
            });

          }, this);
        }

    });

    return AppRouter;

});
