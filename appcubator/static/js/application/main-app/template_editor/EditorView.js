define(function(require, exports, module) {

    'use strict';

    var UrlView = require('app/pages/UrlView');
    var SimpleModalView = require('mixins/SimpleModalView');
    var ErrorModalView = require('mixins/ErrorModalView');
    var DebugOverlay = require('mixins/DebugOverlay');
    var WidgetEditorView = require('editor/WidgetEditorView');
    var EditorGalleryView = require('editor/EditorGalleryView');
    var PageView = require('app/pages/PageView');

    var PageTemplatePicker = require('editor/PageTemplatePicker');
    // var NavbarView = require('editor/NavbarView');
    // var FooterView = require('editor/FooterView');
    var GuideView = require('editor/GuideView');
    var TutorialView = require('tutorial/TutorialView');
    var DeployView = require('app/DeployView');
    var RedoController = require('app/RedoController');
    var CSSEditorView = require('app/css-editor/CSSEditorView');
    var SectionShadowView = require('editor/SectionShadowView');
    var SectionEditorsView = require('editor/SectionEditorsView');

    require('jquery-ui');
    require('mixins/BackboneConvenience');
    require('editor/editor-templates');

    /* An EditorView belongs to a TemplateModel */
    var EditorView = Backbone.View.extend({
        className: 'editor-page',
        css: "bootstrap-editor",

        events: {
            'click .menu-button.help'    : 'help',
            'click .menu-button.question': 'question',
            'click .url-field'           : 'clickedUrl',
            'click .refresh-page'        : 'refreshPage',
            'click #page-info'           : 'pageInfo',
            'click #close-page-info'     : 'closePageInfo',
            'click #design-mode-button'  : 'switchToDesignMode',
            'click #close-css-editor'    : 'switchOffDesignMode',
            'click .mobile-preview'      : 'switchToMobileMode'
        },

        initialize: function(options) {
            _.bindAll(this);

            this.appModel = options.appModel;

            if (options && (options.pageId == "0" || options.pageId  >= 0)) {
                this.pageId = options.pageId;
                pageId = options.pageId;
                this.model = this.appModel.get('templates').models[pageId];
            }
            else if (options.templateModel) {
                this.model = options.templateModel;
            }
            else {
                throw "No Template Model Provided.";
            }

            this.routeModel = v1State.get('routes').getRouteWithTemplate(this.model);
            // note that if the template does not have a route, routeModel will be null.
            this.pageName = this.model.get('name');

            v1State.currentPage = this.model;
            this.appModel.currentPage = this.model;
            v1State.isMobile = false;
            this.appModel.isMobile = false;


            this.sectionsCollection = this.model.getSections();

            this.galleryEditor = new EditorGalleryView(this.sectionsCollection);
            this.sectionsManager = {};
            //this.guides = new GuideView(this.sectionsCollection);
            this.cssEditorView = new CSSEditorView();
            // PageView currently knows how to handle null routeModel
            this.pageView = new PageView(this.routeModel, this.model, pageId);

            // TODO: setup redo controller again
            // this.redoController = new RedoController();
            this.widgetEditorView = new WidgetEditorView();
            v1.widgetEditorView = this.WidgetEditorView;

            keyDispatcher.bindComb('meta+e', this.refreshPage);
            keyDispatcher.bindComb('ctrl+e', this.refreshPage);

            // keyDispatcher.bindComb('ctrl+z', this.redoController.undo);
            // keyDispatcher.bindComb('meta+shift+z', this.redoController.redo);
            // keyDispatcher.bindComb('ctrl+shift+z', this.redoController.redo);

            //g_guides = this.guides;

            this.title = "Editor";

            if(this.routeModel) {
                this.urlModel = this.routeModel.get('url');
                this.listenTo(this.routeModel.get('url').get('urlparts'), 'add remove', this.renderUrlBar);
            }

            this.listenTo(this.model, 'scroll', this.scrollTo);

        },

        render: function() {

            this.start = new Date().getTime();

            var self = this;
            if (!this.el.innerHTML) {
                this.el.innerHTML = _.template(util.getHTML('editor-page'), {
                    pageId: this.pageId
                });
            }

            document.body.style.overflow = "hidden";

            this.renderUrlBar();
            this.galleryEditor.render();

            this.el.appendChild(this.widgetEditorView.render().el);
            this.cssEditorView.setElement($('#css-editor-panel')).render();
            this.pageView.setElement($('#page-view-panel')).render();

            /* Access to elements inside iframe */
            var iframe = document.getElementById('page');
            this.iframe = iframe;

            this.setupPageWrapper();

            window.addEventListener('resize', this.setupPageWrapper);

            $('#loading-gif').fadeOut().remove();

            $('.left-buttons').tooltip({
                position: {
                    my: "left+10 center",
                    at: "right center",
                    using: function(position, feedback) {
                        $(this).css(position);
                        $("<div>")
                            .addClass("arrow")
                            .addClass(feedback.vertical)
                            .addClass(feedback.horizontal)
                            .appendTo(this);
                    }
                }
            });

            this.$pageContainer = this.$el.find('.page-container');
            return this;
        },

        renderIFrameContent: function(proxy) {
            var self = this;
            var iframe = document.getElementById('page');
            innerDoc = iframe.contentDocument || iframe.contentWindow.document;

            this.widgetEditorView.setupScrollEvents();

            keyDispatcher.addEnvironment(innerDoc);

            this.iframeProxy = proxy;
            //this.marqueeView = proxy.setupMarqueeView(this.sectionsCollection.getAllWidgets());

            this.iframeProxy.injectHeader(this.model.get('head'));

            this.sectionsManager = proxy.setupSectionsManager(this.sectionsCollection);
            this.sectionShadowView = new SectionShadowView(this.sectionsCollection);
            this.sectionEditorsView = new SectionEditorsView(this.sectionsCollection);

            self.iframedoc = innerDoc;
            //self.marqueeView.render();
            self.sectionsManager.render();
            self.sectionShadowView.render();
            self.sectionEditorsView.render();

            //self.guides.setElement(innerDoc.getElementById('elements-container')).render();
            //$(innerDoc.getElementById('elements-container')).append(self.marqueeView.el);

            self.startUIStateUpdater(proxy);

            /* TODO re-implement page templates
            if (!this.model.get('uielements').length) {
                var templatePicker = new PageTemplatePicker({ model: this.model, callback: function() {
                    $('.options-area').hide();
                    $('.page-wrapper').addClass('show');
                }});

                this.$el.find('.options-area').append(templatePicker.render().el);
            }
            else { */

            this.$el.find('.page-wrapper').addClass('show');
            this.iframeProxy.updateScrollbar();
            this.$el.find('.loader').remove();
            var end = new Date().getTime();
            var time = end - this.start;
            console.log('Load time: ' + time);

            /* } */
        },

        getCurrentTemplate: function() {
            return this.templateModel;
        },

        renderUrlBar: function() {
            if(this.routeModel) {
                this.$el.find('.url-field').html(this.urlModel.getUrlString());
            }
        },

        help: function(e) {
            new TutorialView([6]);
        },

        startUIStateUpdater: function(proxy) {
            var self = this;
            this.listenTo(v1UIEState, 'synced', proxy.reArrangeCSSTag);

            this.UIStateTimer = setInterval(function() {
                self.fetchUIState(function(state) {
                    /* crappy fix */
                    _.each(state.texts, function(text) {
                        text.tagName = "div";
                    });

                    if (!_.isEqual(state, uieState)) {
                        self.renewUIEState(state, proxy);
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

        renewUIEState: function(newState, proxy) {
            uieState = newState;
            proxy.reArrangeCSSTag();
        },

        question: function(e) {
            olark('api.box.show');
            olark('api.box.expand');
        },

        clickedUrl: function() {
            var newView = new UrlView(this.urlModel, this.model);
            newView.onClose = this.renderUrlBar;
        },

        refreshPage: function() {
            this.widgetEditorView.clear();
            this.sectionsManager.close();
            this.sectionsManager = null;
            var self = this;
            v1.currentApp.fetchPlugins(function() {
                self.iframeProxy.reloadPage();
            });
        },

        setupPageWrapper: function() {
            var height = window.innerHeight - 90;
            util.get('page-wrapper').style.height = height + 'px';
            this.$el.find('.page.full').css('height', height - 46);
        },

        scrollTo: function(widget) {

            var pageHeight = window.innerHeight - 90 - 46;
            var pageTop = $('#page').scrollTop();

            var pageHeightUnit = Math.floor(pageHeight / 15);
            var topUnit = Math.floor(pageTop / 15);

            if ((widget.getBottom() + 6) > (pageHeightUnit + topUnit)) {
                $('#page').scrollTop((widget.getBottom() - pageHeightUnit + widget.get('layout').get('height') + 1) * 15);
            }

        },

        pageInfo: function() {
            this.pageView.expand();
        },

        closePageInfo: function() {
            this.pageView.hide();
            $('.left-buttons').removeClass('invisible');
            this.$pageContainer.removeClass('packed');
            this.galleryEditor.show();
        },

        switchToDesignMode: function() {
            this.cssEditorView.expand();
            $('.left-buttons').addClass('invisible');
            this.$pageContainer.addClass('packed');
            this.galleryEditor.hide();
        },

        switchOffDesignMode: function() {
            this.cssEditorView.hide();
            $('.left-buttons').removeClass('invisible');
            this.$pageContainer.removeClass('packed');
            this.galleryEditor.show();
        },

        switchToMobileMode: function() {
            
            if (!this.mobilePreview) {
                util.get('page-wrapper').style.width = 270 + 'px';
                this.mobilePreview = true;
                $('.mobile-preview').addClass('active');
            }
            else {
                util.get('page-wrapper').style.width = "";
                this.mobilePreview = false;
                $('.mobile-preview').removeClass('active');
            }
            
        },

        close: function() {

            g_guides = null;
            window.removeEventListener('resize', this.setupPageWrapper);
            document.body.style.overflow = "";

            clearInterval(this.UIStateTimer);

            // keyDispatcher.unbind('meta+z', this.redoController.redo);
            // keyDispatcher.unbind('ctrl+z', this.redoController.redo);

            // TODO: fix this
            //EditorView.__super__.close.call(this);
            this.undelegateEvents();
            this.$el.removeData().unbind();
            this.remove();
            this.unbind();
        }

    });

    return EditorView;
});
