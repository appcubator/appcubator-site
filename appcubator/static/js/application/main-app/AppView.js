define(function(require, exports, module) {

    'use strict';
    require('backbone');
    var DeployManagerModel = require('./DeployManagerModel');
    var ToolBarView = require('editor/ToolBarView');
    var EditorView = require('editor/EditorView');
    var PluginsView = require('app/PluginsView');


    var SoftErrorView = require("app/SoftErrorView");
    var ErrorDialogueView = require('mixins/ErrorDialogueView');
    var EntitiesView = require('app/entities/EntitiesView');


    var AppView = Backbone.View.extend({

        events: {
            'click #save': 'save',
            'click #left-menu-toggle': 'toggleTopMenu',
            'click #deploy': 'deployApp'
        },

        el: document.getElementById('app-content'),

        initialize: function(options) {
            _.bindAll(this);

            this.model = options.model;
            this.appId = options.appId;
            this.pageId = options.pageId;

            this.toolBar = new ToolBarView({
                pageId: -1
            });

            this.listenTo(this.model.get('tables'), 'add', this.entityAdded);
            this.autoAddLinksToNavbar();

            this.entitiesView = new EntitiesView();
            this.entitiesView.setToggleEl($('.menu-app-entities'));

            this.deployManager = new DeployManagerModel(this.appId);

            //var autoSave = setInterval(this.save, 30000);
            this.render();
        },

        render: function() {
            var pageId = 0;
            this.pageId = 0;

            var cleanDiv = document.createElement('div');
            cleanDiv.className = "clean-div";
            var mainContainer = document.getElementById('main-container');
            mainContainer.appendChild(cleanDiv);

            this.view = new EditorView({ pageId : 0, appModel: this.model });
            this.view.setElement(cleanDiv).render();

            this.toolBar.setPage(this.pageId);
            this.toolBar.setElement(document.getElementById('tool-bar')).render();
            this.el.appendChild(this.entitiesView.render().el);
            
            this.changePage(EditorView, { pageId: this.pageId, appModel: this.model }, "", function() {});

            this.$leftMenu = this.$el.find('.left-menu-panel-l1 ');
            this.setupMenuHeight();

            $("html, body").animate({
                scrollTop: 0
            });
    
        },

        getCurrentPage: function() {
            return this.view.getCurrentTemplate();
        },

        doKeyBindings: function() {
            keyDispatcher.bindComb('meta+s', this.save);
            keyDispatcher.bindComb('ctrl+s', this.save);
            keyDispatcher.bindComb('meta+c', this.copy);
            keyDispatcher.bindComb('ctrl+c', this.copy);
            keyDispatcher.bindComb('meta+v', this.paste);
            keyDispatcher.bindComb('ctrl+v', this.paste);
        },

        info: function(appId, tutorial) {
            var self = this;
            require(['app/AppInfoView'], function(InfoView) {
                self.tutorialPage = "Application Settings";
                self.changePage(InfoView, {}, tutorial, function() {
                    $('.menu-app-info').addClass('active');
                });
                olark('api.box.show');
            });
        },

        tables: function(tutorial) {
            var self = this;
            this.entitiesView.expand();
        },

        themes: function(tutorial) {
            var self = this;
            self.tutorialPage = "Themes";
            require(['app/ThemesGalleryView'], function(ThemesGalleryView) {
                self.changePage(ThemesGalleryView, {}, tutorial, function() {
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
                self.changePage(PagesView, {}, tutorial, function() {
                    self.trigger('pages-loaded');
                    $('.menu-app-pages').addClass('active');
                });
                olark('api.box.show');
            });
        },

        page: function(pageId) {
            if(pageId == this.pageId) return;
            if (!pageId) pageId = 0;
            
            var self = this;

            this.pageId = pageId;
            self.tutorialPage = "Editor";
            self.tutorialPage = "Introduction";
            self.changePage(EditorView, { pageId: pageId, appModel: this.model }, "", function() {});
            this.toolBar.setPage(this.pageId);
            self.trigger('editor-loaded');
            olark('api.box.hide');
        },

        emails: function(tutorial) {
            // var self = this;
            // self.tutorialPage = "Emails";
            // this.changePage(EmailsView, {}, tutorial, function() {
            //     $('.menu-app-emails').addClass('active');
            // });
        },

        plugins: function(tutorial) {
            var self = this;
            self.tutorialPage = "Plugins";
            this.changePage(PluginsView, {}, tutorial, function() {
                $('.menu-app-plugins').addClass('active');
            });
        },

        renderIFrameContent: function(proxy) {
            this.view.renderIFrameContent(proxy);
        },

        changePage: function(NewView, options, tutorial, post_render) {

            if (this.view) this.view.close();

            var cleanDiv = document.createElement('div');
            cleanDiv.className = "clean-div";
            var mainContainer = document.getElementById('main-container');
            mainContainer.appendChild(cleanDiv);

            this.view = new NewView(options);
            this.view.setElement(cleanDiv).render();

            //v1.changeTitle(this.view.title);

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

        entityAdded: function(entityModel) {
            var pageName = entityModel.get('name') + ' Page';
            var newPage = {
                name: pageName,
                url: {
                    urlparts: [pageName.replace(/ /g, '_'), '{{' + entityModel.get('name') + '}}']
                }
            };
            this.model.get('routes').push(newPage);
        },

        autoAddLinksToNavbar: function() {
            // TODO: fix this
            // this.listenTo(this.model.get('routes'), 'add', function(pageM) {
            //     if (!pageM.isContextFree()) return;
            //     var homePageNav = this.model.get('routes').first().get('navbar');
            //     homePageNav.get('links').push({
            //         url: 'internal://' + pageM.get('name'),
            //         title: pageM.get('name')
            //     });

            // }, this);
        },

        deployApp: function() {
            $('.deploy-text').html('Publishing');
            var threeDots = util.threeDots();
            $('.deploy-text').append(threeDots.el);

            var success_callback = function(data) {
                new DeployView(data);
                $('.deploy-text').html('Publish');
                clearInterval(threeDots.timer);
            };

            var hold_on_callback = function() {
                $('.deploy-text').html('Hold On, Still deploying.');
            };

            this.deployManager.deploy.call(success_callback, hold_on_callback);
        },


        whenDeployed: function(successCallback) {
            var self = this;
            this.getDeploymentStatus(successCallback, function() {
                setTimeout(function() {
                    self.whenDeployed(successCallback);
                }, 1500);
            });
        },

        getDeploymentStatus: function(successCallback, failCallback) {
            $.ajax({
                type: "GET",
                url: '/app/' + appId + '/deploy/',
                success: function(data) {
                    if (data.status !== undefined) {
                        if (data.status === 0) {
                            // I'll need to figure out a better way soon.
                            // new ErrorDialogueView({text: 'Something is wrong... deployment seems to not have gotten the memo.'});
                        } else if (data.status == 1) {
                            failCallback.call(); // deployment task is still running
                        } else if (data.status == 2) {
                            successCallback.call();
                        } else {
                            new ErrorDialogueView({
                                text: 'Deploy status route returned a bad value.'
                            });
                        }
                    } else {
                        alert('Deploy status route returned a bad value.');
                    }
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
            appState = v1State.serialize();
            console.log(appState);

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
                url: '/app/' + this.appId + '/state/',
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

        toggleTopMenu: function() {
            return (this.menuExpanded ? this.hideTopMenu : this.expandTopMenu)();
        },

        expandTopMenu: function() {
                $('#tool-bar').addClass('open');
                $('#main-container').addClass('open');
                this.menuExpanded = true;
                $('#main-container').on('click', this.hideTopMenu);
        },

        hideTopMenu: function() {
                $('#tool-bar').removeClass('open');
                $('#main-container').removeClass('open');
                this.menuExpanded = false;
                $('#main-container').off('click', this.hideTopMenu);
        },

        download: function(callback) {
            var jqxhrToJson = function(jqxhr) {
                var data = {};
                try {
                    data = JSON.parse(jqxhr.responseText);
                } catch (e) {
                    data.errors = ["JSON response from server failed to parse", jqxhr.responseText];
                }
                return data;
            };

            var mergeConflictHandler = function(data) {
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
                }, this.appId);
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

            var hardErrorHandler = function(data) {
                var content = {};
                if (DEBUG) content.text = data.responseText;
                else content.text = "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon.";
                new ErrorDialogueView(content);
                util.log_to_server('deployed app', {
                    status: 'FAILURE',
                    deploy_time: data.deploy_time + " seconds",
                    message: data.errors
                }, this.appId);
                return data;
            };

            var downloadApp = function(callback) {
                var url = '/app/' + appId + '/zip/';
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
                    200: function(data) {
                        util.log_to_server('code downloaded', {}, appId);
                        downloadApp(callback);
                    },
                    400: function(jqxhr) {
                        var data = jqxhrToJson(jqxhr);
                        data = softErrorHandler(data);
                        data = callback(data);
                    },
                    409: function(jqxhr) {
                        var data = jqxhrToJson(jqxhr);
                        data = mergeConflictHandler(data);
                        data = callback(data);
                    },
                    500: function(jqxhr) {
                        var data = jqxhrToJson(jqxhr);
                        data = hardErrorHandler(data);
                        data = callback(data);
                    },
                },
                dataType: "JSON"
            });
        },

        copy: function(e) {
            if (keyDispatcher.textEditing === true) return;
            if (this.view.marqueeView.multiSelectorView.contents.length) {
                this.contents = [];
                _(this.view.marqueeView.multiSelectorView.contents).each(function(model) {
                    this.contents.push(_.clone(model.serialize()));
                }, this);
            } else if (this.view.widgetsManager.widgetSelectorView.selectedEl) {
                this.contents = [];
                this.contents.push(_.clone(this.view.widgetsManager.widgetSelectorView.selectedEl.serialize()));
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
                    coll.last(function(widgetModel) {
                        widgetModel.trigger('selected');
                    });
                } else if (this.contents.length > 1) {
                    var newContents = coll.last(this.contents.length);
                    this.view.marqueeView.multiSelectorView.setContents(newContents);
                }
            }
        },

        setupMenuHeight: function() {
            var height = $(document).height();
            this.$leftMenu.height(height);
        }

    });

    return AppView;
});