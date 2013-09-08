define(function(require, exports, module) {
    'use strict';

    var SimpleModalView    = require("mixins/SimpleModalView");
    var ErrorDialogueView  = require("mixins/ErrorDialogueView");
    var SimpleDialogueView = require("mixins/SimpleDialogueView");

    var TutorialView  = require("tutorial/TutorialView"),
        EmailsView    = require("app/emails/EmailsView"),
        DeployView    = require("app/DeployView"),
        SoftErrorView = require("app/SoftErrorView"),
        GarageView    = require("app/GarageView");

    var AppRouter = Backbone.Router.extend({

        routes: {
            "app/:appid/info/*tutorial"        : "info",
            "app/:appid/tables/*tutorial"      : "tables",
            "app/:appid/gallery/*tutorial"     : "themes",
            "app/:appid/pages/*tutorial"       : "pages",
            "app/:appid/editor/:pageid/"       : "editor",
            "app/:appid/mobile-editor/:pageid/": "mobileEditor",
            "app/:appid/emails/*tutorial"      : "emails",
            "app/:appid/*tutorial"             : "index",
            "app/:appid/*anything/"            : "index"
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

            if(appId !== 0) {
                this.garageView = new GarageView();
                $('.garage-toggle').on('click', this.garageView.show);
            }

            this.listenTo(v1State.get('tables'), 'add', this.entityAdded);
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
            var self = this;

            self.tutorialPage = "Editor";

            require(['editor/EditorView'], function(EditorView) {
                $('.page').fadeOut();
                if (v1.view) v1.view.close();
                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                $(document.body).append(cleanDiv);

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
            $('.page').fadeOut();
            self.tutorialPage = "Editor";
            require(['m-editor/MobileEditorView'], function(MobileEditorView) {
                if (v1.view) v1.view.close();
                var cleanDiv = document.createElement('div');
                cleanDiv.className = "clean-div editor-page";
                $(document.body).append(cleanDiv);

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
            $('.pull-right.dropd').removeClass('open');
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
            var before_deploy = new Date().getTime();
            v1.disableSave = true;

            console.log("YOLO")
            $.ajax({
                type: "POST",
                url: '/app/' + appId + '/deploy/',
                success: function(data) {
                    v1.disableSave = false;
                    isDeployed = true;
                    var deploy_time = (new Date().getTime() - before_deploy) / 1000;
                    if (callback) v1.whenDeployed(callback);
                    // open a modal based on deploy response
                    if (data.errors) {
                        var content = {
                            text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon."
                        };
                        if (DEBUG) {
                            content = {
                                text: data.errors
                            };
                        }
                        new ErrorDialogueView(content);
                        util.log_to_server('deployed app', {
                            status: 'FAILURE',
                            deploy_time: deploy_time + " seconds",
                            message: data.errors
                        }, appId);
                    } else if (data.files && data.branch) {
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
                            deploy_time: deploy_time + " seconds",
                            message: data
                        }, appId);
                    } else {
                        v1.whenDeployed(function() {
                            new DeployView(data);
                            util.log_to_server('deployed app', {
                                status: 'success',
                                deploy_time: deploy_time + " seconds"
                            }, appId);
                            self.trigger('deployed');
                        });
                    }
                },
                error: function(data) {
                    v1.disableSave = false;
                    isDeployed = true;
                    var deploy_time = (new Date().getTime() - before_deploy) / 1000;
                    var content = {
                        text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon."
                    };
                    if (DEBUG) {
                        content = {
                            text: data.responseText
                        };
                    }
                    new ErrorDialogueView(content);
                    util.log_to_server('deployed app', {
                        status: 'FAILURE',
                        deploy_time: deploy_time + " seconds",
                        message: data.responseText
                    }, appId);
                },
                dataType: "JSON"
            });

            var holdOnTimer = setTimeout(function() {
                if (!isDeployed) hold_on_callback.call();
                clearTimeout(holdOnTimer);
            }, 10000);
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
                new ErrorDialogueView(content, function() {
                    v1.disableSave = false;
                });
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

        betaCheck: function(data) {
            if (data.percentage > 30 && data.feedback === true) {
                $('.notice').css('height', '118px');
                $('.notice').html('<h3 class="">Thank you for joining Appcubator Private Beta program!</h3><div>You can claim your free domain from <a class="menu-app-info">Domain & SEO</a> page.</div>');
                v1.menuBindings();
            }

            if (data.percentage > 30) {
                $('#tutorial-check').prop('checked', true);
            }
            if (data.feedback === true) {
                $('#feedback-check').prop('checked', true);
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
                console.log("paste");
                console.log(this.view);
                console.log(this.contents);
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
                    console.log(data);
                    if(data.status !== undefined) {
                        if (data.status === 0) {
                            alert('something is wrong... deployment seems to not have gotten the memo.');
                        }
                        else if (data.status == 1) {
                            failCallback.call(); // deployment task is still running
                        }
                        else if (data.status == 2) {
                            successCallback.call();
                        }
                        else {
                            alert('Deploy status route returned a bad value.');
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
        }

    });

    return AppRouter;

});
