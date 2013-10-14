define([
        'models/PageModel',
        'collections/TableCollection',
        'app/pages/UrlView',
        'mixins/SimpleModalView',
        'mixins/ErrorModalView',
        'mixins/DebugOverlay',
        'editor/WidgetsManagerView',
        'editor/WidgetEditorView',
        'editor/EditorGalleryView',
        'editor/PageTemplatePicker',
        'editor/NavbarView',
        'editor/FooterView',
        'editor/GuideView',
        'editor/MarqueeView',
        'editor/ToolBarView',
        'tutorial/TutorialView',
        'app/DeployView',
        'app/RedoController',
        'editor/editor-templates'
    ],
    function(PageModel,
        TableCollection,
        UrlView,
        SimpleModalView,
        ErrorModalView,
        DebugOverlay,
        WidgetsManagerView,
        WidgetEditorView,
        EditorGalleryView,
        PageTemplatePicker,
        NavbarView,
        FooterView,
        GuideView,
        MarqueeView,
        ToolBarView,
        TutorialView,
        DeployView,
        RedoController) {
        
        var EditorView = Backbone.View.extend({
            className: 'editor-page',
            css: "bootstrap-editor",

            events: {
                'click #editor-save': 'save',
                'click #deploy': 'deploy',
                'click .menu-button.help': 'help',
                'click .menu-button.question': 'question',
                'click .url-bar': 'clickedUrl'
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
                this.widgetsManager = new WidgetsManagerView(this.widgetsCollection);
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

                this.listenTo(this.model.get('url').get('urlparts'), 'add remove', this.renderUrlBar);
                this.listenTo(this.model, 'scroll', this.scrollTo);

                this.startUIStateUpdater();
            },

            render: function() {

                if (!this.el.innerHTML) this.el.innerHTML = util.getHTML('editor-page');

                document.body.style.overflow = "hidden";

                this.toolBar.setElement(document.getElementById('tool-bar')).render();
                this.marqueeView.render();
                this.renderUrlBar();
                this.galleryEditor.render();
                this.widgetsManager.render();
                this.navbar.setElement('#navbar').render();
                this.footer.setElement('#footer').render();
                this.guides.setElement($('#elements-container')).render();

                $('#elements-container').append(this.marqueeView.el);

                this.setupPageWrapper();
                this.setupPageHeight();
                this.setupPageHeightBindings();

                window.addEventListener('resize', this.setupPageWrapper);

                $('#loading-gif').fadeOut().remove();

                if (!this.model.get('uielements').length) {
                    new PageTemplatePicker(this.model);
                }

                if(appId !== 0) {
                    v1.garageView.setEnvironmentEditor();
                    v1.worldView.setEnvironmentEditor();
                    $('.garage-toggle.menu-button').on('click', v1.garageView.toggle);
                    $('.garage-toggle.menu-button').on('click', v1.worldView.hide);
                    $('.world-toggle.menu-button').on('click', v1.garageView.hide);
                }

                $('.world-toggle.menu-button').on('click', v1.worldView.toggle);
                
                return this;
            },

            renderUrlBar: function() {
                this.$el.find('.url-bar').html(this.urlModel.getUrlString());
            },

            save: function(callback) {
                v1.save();
                return false;
            },

            help: function(e) {
                new TutorialView([6]);
            },

            startUIStateUpdater: function() {
                var self = this;
                this.UIStateTimer = setInterval(function() {
                    self.fetchUIState(function(state) {
                        console.log(state);
                        /* crappy fix */
                        _.each(state.texts, function (text) {
                            text.tagName = "div";
                        });

                        if (!_.isEqual(state, uieState)) {
                            self.renewUIEState(state);
                        }
                    });

                }, 10000);
            },

            fetchUIState: function(callback) {
                $.ajax({
                    type: "GET",
                    url: '/app/' + appId + '/uiestate/',
                    statusCode: {
                        200: callback,
                        400: callback,
                    },
                    dataType: "JSON"
                });
            },

            renewUIEState: function(newState) {
                uieState = newState;
                v1.reArrangeCSSTag();
            },

            question: function(e) {
                olark('api.box.show');
                olark('api.box.expand');
            },

            deploy: function(options) {
                var url = '/app/' + appId + '/deploy/';
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

                var urlSuffix = '/' + self.urlModel.getAppendixString();
                if (urlSuffix != '/') urlSuffix += '/';
                v1.deploy(success_callback, hold_on_callback, {
                    appendToUrl: urlSuffix
                });
            },

            clickedUrl: function() {
                var newView = new UrlView(this.urlModel, this.model);
                newView.onClose = this.renderUrlBar;
            },

            setupPageWrapper: function() {
                var height = window.innerHeight - 90;
                util.get('page-wrapper').style.height = height + 'px';
                this.$el.find('.page.full').css('height', height - 46);
            },

            setupPageHeightBindings: function() {
                this.listenTo(this.model.get('uielements'), 'add', function(uielem) {
                    this.setupPageHeight();
                    this.listenTo(uielem.get('layout'), 'change', this.setupPageHeight);
                }, this);

                this.model.get('uielements').each(function(uielem) {
                    this.listenTo(uielem.get('layout'), 'change', this.setupPageHeight);
                }, this);
            },

            setupPageHeight: function() {
                var $container = this.$el.find('#elements-container');
                var oldHeight = this.currentHeight;

                this.currentHeight = (this.model.getHeight() + 12) * 15;
                if (this.currentHeight < 800) this.currentHeight = 800;
                $container.css('height', this.currentHeight);

                if (this.currentHeight > oldHeight) {
                    util.scrollToBottom($('#page'));
                }
            },

            scrollTo: function(widget) {

                var pageHeight = window.innerHeight - 90 - 46;
                var pageTop = $('#page').scrollTop();

                var pageHeightUnit = Math.floor(pageHeight / 15);
                var topUnit = Math.floor(pageTop / 15);

                if((widget.getBottom() + 6) > (pageHeightUnit + topUnit)) {
                    $('#page').scrollTop((widget.getBottom() - pageHeightUnit + widget.get('layout').get('height') + 1) * 15);
                }

            },

            close: function() {

                v1.garageView.unsetEnvironmentEditor();
                v1.garageView.hide();
                v1.worldView.unsetEnvironmentEditor();
                v1.worldView.hide();
                g_guides = null;
                window.removeEventListener('resize', this.setupPageWrapper);
                document.body.style.overflow = "";

                clearInterval(this.UIStateTimer);

                keyDispatcher.unbind('meta+z', redoController.redo);
                keyDispatcher.unbind('ctrl+z', redoController.redo);

                Backbone.View.prototype.close.call(this);
            }

        });

        return EditorView;
    });