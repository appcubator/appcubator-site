define(function(require, exports, module) {

    'use strict';
    require('backbone');

    var DeployManagerModel = require('./DeployManagerModel');
    var ToolBarView = require('editor/ToolBarView');
    var EditorView = require('editor/EditorView');
    var PluginsView = require('app/plugins_view/PluginsView');
    var SettingsView = require('app/SettingsView');
    var RoutesView = require('app/RoutesView');

    var PluginsModel = require('models/PluginsModel');

    var SoftErrorView = require("app/SoftErrorView");
    var ErrorDialogueView = require('mixins/ErrorDialogueView');
    var NodeModelsView = require('app/models_view/NodeModelsView');


    var AppView = Backbone.View.extend({

        events: {
            'click #save': 'save',
            'click #left-menu-toggle': 'toggleTopMenu',
            'click #deploy': 'deployApp',
            'click .undo': 'undo',
            'click .redo': 'redo'
        },

        el: document.getElementById('app-content'),

        initialize: function(options) {
            _.bindAll(this);

            this.model = options.model;
            this.appId = options.appId;
            this.pageId = options.pageId;

            this.toolBar = this.createSubview(ToolBarView, { pageId: -1 });

            this.routesView = this.createSubview(RoutesView);
            this.routesView.setToggleEl($('.menu-app-routes'));
            this.routesView.setPointerPosition("130px");

            this.nodeModelsView = this.createSubview(NodeModelsView);
            this.nodeModelsView.setToggleEl($('.menu-app-entities'));
            this.nodeModelsView.setPointerPosition("180px");

            this.pluginsView = this.createSubview(PluginsView);
            this.pluginsView.setToggleEl($('.menu-app-plugins'));
            this.pluginsView.setPointerPosition("230px");

            this.settingsView = this.createSubview(SettingsView);
            this.settingsView.setToggleEl($('.menu-app-settings'));
            this.settingsView.setPointerPosition("30px");

            this.deployManager = new DeployManagerModel(this.appId);
            this.listenTo(v1State.get('plugins'), 'fork', this.save);

            //var autoSave = setInterval(this.save, 30000);
            this.render();

            util.askBeforeLeave();

        },

        render: function() {
            var pageId = 0;
            this.pageId = 0;

            var cleanDiv = document.createElement('div');
            cleanDiv.className = "clean-div";
            var mainContainer = document.getElementById('main-container');
            mainContainer.appendChild(cleanDiv);

            this.toolBar.setPage(this.pageId);
            this.toolBar.setElement(document.getElementById('tool-bar')).render();

            this.el.appendChild(this.nodeModelsView.render().el);
            this.el.appendChild(this.pluginsView.render().el);
            this.el.appendChild(this.settingsView.render().el);
            this.el.appendChild(this.routesView.render().el);


            this.$leftMenu = this.$el.find('.left-menu-panel-l1 ');
            this.setupMenuHeight();

            $("html, body").animate({
                scrollTop: 0
            });

            this.doKeyBindings();
            Backbone.Regrettable.reset();

        },

        getCurrentPage: function() {
            return this.view.getCurrentTemplate();
        },

        showTemplateWithName: function(templateName) {

        },

        doKeyBindings: function() {
            keyDispatcher.bindComb('meta+s', this.save);
            keyDispatcher.bindComb('ctrl+s', this.save);
            // keyDispatcher.bindComb('meta+c', this.copy);
            // keyDispatcher.bindComb('ctrl+c', this.copy);
            // keyDispatcher.bindComb('meta+v', this.paste);
            // keyDispatcher.bindComb('ctrl+v', this.paste);
            keyDispatcher.bindComb('meta+z', this.undo);
            keyDispatcher.bindComb('ctrl+z', this.undo);
            keyDispatcher.bindComb('meta+y', this.redo);
            keyDispatcher.bindComb('ctrl+y', this.redo);

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
            this.nodeModelsView.expand();
        },

        pages: function(appId, tutorial) {
            var self = this;
            self.tutorialPage = "Pages";
            require(['app/pages/PagesView'], function(PagesView) {
                $('#page').fadeIn();
                self.changePage(PagesView, {}, tutorial, function() {
                    self.trigger('pages-loaded');
                    $('.menu-app-pages').addClass('active');
                });
                olark('api.box.show');
            });
        },

        pageWithName: function(pageName) {
            var templateModel = this.model.get('templates').getTemplateWithName(pageName);
            this.page(templateModel);
        },

        pageWithIndex: function(pageId) {
            var templateModel = this.model.get('templates').models[pageId];
            this.page(templateModel);
        },

        page: function(templateModel) {

            if (this.view && templateModel == this.view.templateModel) return;
            if (!templateModel) templateModel = this.model.get('templates').models[0];
            this.tutorialPage = "Editor";
            this.tutorialPage = "Introduction";
            this.changePage(EditorView, { templateModel: templateModel, appModel: this.model }, "", function() {});

            this.toolBar.setTemplate(templateModel);

            this.$leftMenu = this.$el.find('.left-menu-panel-l1 ');
            this.setupMenuHeight();
            this.trigger('editor-loaded');
            olark('api.box.hide');
        },

        plugins: function(tutorial) {
            var self = this;
            this.pluginsView.expand();
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

            this.view = this.createSubview(NewView, options);
            this.view.setElement(cleanDiv).render();

            //v1.changeTitle(this.view.title);

            $("html, body").animate({
                scrollTop: 0
            });
            $('#page').fadeIn();
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

        undo: function() {
            Backbone.Regrettable.undo();
        },

        redo: function() {
            Backbone.Regrettable.redo();
        },

        deployApp: function() {
            $('.deploy-text').html('Publishing');
            var threeDots = util.threeDots();
            $('.deploy-text').append(threeDots.el);

            var success_callback = function(data) {
                $('.deploy-text').html('Publish');
                clearInterval(threeDots.timer);
            };

            var hold_on_callback = function() {
                $('.deploy-text').html('Hold On, Still deploying.');
            };

            this.deployManager.deploy.call(this, success_callback, hold_on_callback);
        },

        save: function(e, callback) {
            if (v1.disableSave === true) return;
            if (appId === 0) return;

            $('#save-icon').attr('src', '/static/img/ajax-loader-white.gif');
            var $el = $('.menu-button.save');
            $el.fadeOut().html("<span class='icon'></span><span>Saving...</span>").fadeIn();

            var self = this;
            appState = v1State.serialize();
            if(DEBUG) console.log(appState);

            var successHandler = function(data) {
                util.dontAskBeforeLeave();
                v1.disableSave = false;

                v1State.set('version_id', data.version_id);

                $('#save-icon').attr('src', '/static/img/checkmark.png').hide().fadeIn();
                var timer = setTimeout(function() {
                    $('#save-icon').attr('src', '/static/img/save.png').hide().fadeIn();
                    clearTimeout(timer);
                }, 1000);
                $('.menu-button.save').html("<span class='icon'></span><span>Saved</span>").fadeIn();

                if ((typeof(callback) !== 'undefined') && (typeof(callback) == 'function')) {
                    callback();
                }

                var timer2 = setTimeout(function() {
                    $el.html("<span class='icon'></span><span>Save</span>").fadeIn();
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
                    content.text += '<br><br><br>Refreshing in <span id="countdown-ksikka">6</span> seconds...\n';
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

        fetchPlugins: function(callback) {
            var self = this;
            $.ajax({
                type: "GET",
                url: '/app/' + appId + '/state/',
                statusCode: {
                    200: function(data) {

                        self.refreshPlugins(data.plugins);
                        callback.call(this);
                    }
                },
                dataType: "JSON"
            });

        },

        refreshPlugins: function(freshPlugins) {

            var plugins = v1State.get('plugins').toJSON();

            if(!_.isEqual(plugins, freshPlugins)) {
                console.log("REFRESHED PLUGINS");
                v1State.set('plugins', new PluginsModel(freshPlugins));
            }
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
                    500: function(jqxhr) {
                        var data = jqxhrToJson(jqxhr);
                        data = hardErrorHandler(data);
                        data = callback(data);
                    },
                },
                dataType: "JSON"
            });
        },

        setupMenuHeight: function() {
            var height = $(document).height();

            this.$leftMenu.each(function() {
                $(this).height(height);
            });

            var self = this;
            $( window ).resize(function() {
                var height = $(document).height();
                self.$leftMenu.height(height);
            });
        }

    });

    return AppView;
});
