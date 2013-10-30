define(['editor/EditorView', './SignupDeployView','editor/MarqueeView', 'editor/EditorGalleryView', 'editor/WidgetsManagerView', 'editor/GuideView', 'editor/ToolBarView', 'app/RedoController', 'editor/NavbarView', 'editor/FooterView', 'mixins/SimpleModalView', 'editor/WidgetEditorViewProxy'],

function(EditorView, SignupDeployView, MarqueeView, EditorGalleryView, WidgetsManagerView, GuideView, ToolBarView, RedoController, NavbarView, FooterView, SimpleModalView, WidgetEditorViewProxy) {

    var ExternalEditorView = EditorView.extend({

        events    : {
          'click #editor-save'   : 'save',
          'click #deploy'        : 'deploy',
          'click .menu-button.help' : 'help',
          'click .menu-button.question' : 'question',
          'click .url-bar'       : 'clickedUrl'
        },

        initialize: function(options) {
                _.bindAll(this);
                this.subviews = [];

                if (options && options.pageId) pageId = options.pageId;

                util.loadCSS('jquery-ui');

                this.model = v1State.get('pages').models[pageId];
                v1State.currentPage = this.model;
                v1State.isMobile = false;

                this.widgetsCollection = this.model.get('uielements');

                this.marqueeView = new MarqueeView();
                this.galleryEditor = new EditorGalleryView(this.widgetsCollection);
                this.widgetsManager = {};
                this.guides = new GuideView(this.widgetsCollection);
                this.toolBar = new ToolBarView();

                redoController = new RedoController();

                keyDispatcher.bindComb('meta+z', redoController.undo);
                keyDispatcher.bindComb('ctrl+z', redoController.undo);
                keyDispatcher.bindComb('meta+shift+z', redoController.redo);
                keyDispatcher.bindComb('ctrl+shift+z', redoController.redo);

                g_guides = this.guides;

                this.navbar = new NavbarView(this.model.get('navbar'));
                this.footer = new FooterView(this.model.get('footer'));
                this.urlModel = this.model.get('url');

                this.title = "Editor";

                this.subviews = [this.marqueeView,
                    this.galleryEditor,
                    this.widgetsManager,
                    this.guides,
                    this.toolBar,
                    this.navbar,
                    this.footer
                ];

                this.pageId = 0;
                this.listenTo(this.model.get('url').get('urlparts'), 'add remove', this.renderUrlBar);
       
                this.widgetEditorViewProxy = WidgetEditorViewProxy;
        },

        render: function() {
            ExternalEditorView.__super__.render.call(this);

            require(['./QuickStartTour'], function(QuickTour) {
                if (!QuickTour.currentStep) return;
                var url = QuickTour.currentStep.url;
                QuickTour.start();
            });

            if(this.galleryEditor) {
                this.galleryEditor.expandAllSections();
            }

            return this;
        },

        save: function(callback) {
            new SimpleModalView({ text: "<span style='font-size: 24px; line-height: 32px; font-family:\"proxima-nova\";'>Looks like you really liked Appcubator. You need to <a style='display: inline;' href='/signup'>signup</a> to be able to save your progress.</span>"});
        },

        startUIStateUpdater: function() { console.log("START ME"); },

        renewUIEState: function(newState) { console.log("CALL ME"); },

        deploy: function() {

            var self = this;
            util.get('deploy-text').innerHTML = 'Publishing';
            var threeDots = util.threeDots();
            util.get('deploy-text').appendChild(threeDots.el);

            var success_callback = function() {
                util.get('deploy-text').innerHTML = 'Publish';
                clearInterval(threeDots.timer);
            };

            var hold_on_callback = function() {
                util.get('deploy-text').innerHTML = 'Hold On, It\'s still deploying.';
            };

            if (this.disableSave === true) return;

            var self = this;
            var isDeployed = false;
            var before_deploy = new Date().getTime();
            this.disableSave = true;

            var newState = v1State.toJSON();
            
            _.each(newState.pages[0].uielements, function(val, key) {
                if(val.type && val.type == "form") {
                    if(val.data && val.data.container_info && val.data.container_info.action == "create") {
                        val.data.container_info.entity = "Tweet";
                    }
                }
            });

            $.ajax({
                type: "POST",
                url: '/resources/editor/publish/',
                data: {
                    app_state: JSON.stringify(v1State.toJSON())
                },
                success: function(data) {
                    self.disableSave = false;
                    var deploy_time = (new Date().getTime() - before_deploy) / 1000;
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
                        self.whenDeployed(function() {
                            console.log(data);
                            new SignupDeployView(data);

                            success_callback.call(self);
                            isDeployed = true;

                            util.log_to_server('deployed app', {
                                status: 'success',
                                deploy_time: deploy_time + " seconds"
                            }, appId);
                            self.trigger('deployed');
                        });
                    }

                }
            });

            var holdOnTimer = setTimeout(function() {
                if (!isDeployed) hold_on_callback.call();
                clearTimeout(holdOnTimer);
            }, 10000);
        },

        getDeploymentStatus: function(successCallback, failCallback) {

            $.ajax({
                type: "GET",
                url: '/resources/editor/publish/',
                success: function(data) {
                    console.log(data);
                    if (data.status !== undefined) {
                        if (data.status === 0) {
                            alert('something is wrong... deployment seems to not have gotten the memo.');
                        } else if (data.status == 1) {
                            failCallback.call(); // deployment task is still running
                        } else if (data.status == 2) {
                            successCallback.call();
                        } else {
                            alert('Deploy status route returned a bad value.');
                        }
                    } else {
                        alert('Deploy status route returned a bad value.');
                    }
                },
                dataType: "JSON"
            });
        },

        whenDeployed: function(successCallback) {
            var self = this;
            this.getDeploymentStatus(successCallback, function() {
                setTimeout(function() {
                    self.whenDeployed(successCallback);
                }, 1500);
            });
        }


    });

    return ExternalEditorView;
});