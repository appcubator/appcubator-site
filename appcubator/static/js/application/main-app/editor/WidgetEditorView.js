define(function(require, exports, module) {

    'use strict';

    require('mixins/BackboneUI');
    require('util');

    var WidgetContentEditorView = require('editor/WidgetContentEditorView');
    var WidgetLayoutEditorView  = require('editor/WidgetLayoutEditorView');
    var ImageSliderEditorView   = require('editor/ImageSliderEditorView');
    var WidgetClassPickerView   = require('editor/WidgetClassPickerView');
    var SearchEditorView        = require('editor/SearchEditorView');
    var FacebookShareEditor     = require('editor/FacebookShareEditor');
    var VideoEmbedEditor        = require('editor/VideoEmbedEditor');
    var RowGalleryView          = require('editor/list-editor/RowGalleryView');
    var FormEditorView          = require('editor/form-editor/FormEditorView');
    var LoginFormEditorView     = require('editor/form-editor/LoginFormEditorView');
    var QueryEditorView         = require('editor/QueryEditorView');
    var CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal');
    var GenericModelFieldEditor = require('mixins/GenericModelFieldEditor');

    var WidgetEditorView = Backbone.UIView.extend({
        
        className: 'widget-editor animated',
        id: 'widget-editor',
        tagName: 'div',
        css: 'widget-editor',
        type: 'widget',
        subviews: [],

        events: {
            'click .edit-slides-button': 'openSlideEditor',
            'click .query-editor-btn': 'openQueryEditor',
            'click .edit-row-btn': 'openRowEditor',
            'click .form-editor-btn': 'openFormEditor',
            'click .pick-style': 'openStylePicker',
            'click .search-editor-btn': 'openSearchEditor',
            'click .edit-login-form-btn': 'openLoginEditor',
            'click .link-to-page-button': 'openFBShareEditor',
            'click .video-link-button': 'openVideoEmbedEditor',
            'click .done-editing': 'closeEditingMode',
            'click .delete-button': 'clickedDelete',
            'click .done-text-editing': 'clickedDoneTextEditing',
            'click .edit-custom-widget-btn': 'openCustomWidgetEditor',
            'click .edit-itemname-btn': 'clickedEditItemName',
            'click': 'clicked',
            'change select': 'mouseup'
        },

        initialize: function() {
            _.bindAll(this);
            this.subviews = [];
            util.loadCSS(this.css);
            this.model = null;
        },

        setModel: function(widgetModel) {
            if (this.model) {
                this.stopListening(this.model, 'startEditing', this.startedEditing);
                this.stopListening(this.model, 'stopEditing cancelEditing', this.stoppedEditing);
                this.stopListening(this.model, 'doubleClicked', this.doubleClicked);
            }

            this.model = widgetModel;

            this.listenTo(this.model, 'startEditing', this.startedEditing);
            this.listenTo(this.model, 'stopEditing cancelEditing', this.stoppedEditing);
            this.listenTo(this.model, 'doubleClicked', this.doubleClicked);

            this.listenTo(this.model, 'reselected', this.show);
            // this.listenTo(this.model.get('layout'), 'change', this.hide);

            this.listenTo(this.model, 'deselected', this.clear);

            return this;
        },

        render: function() {
            this.hide();
            return this;
        },

        setupScrollEvents: function() {
            var self = this;
            var timer;
            $(innerDoc).bind('scroll',function () {
                clearTimeout(timer);
                timer = setTimeout( refresh , 150 );
                self.hide();
            });

            var refresh = function () {
                // do stuff
                self.show();
            };

        },

        display: function() {
            this.filleContent();
            this.show();
        },

        show: function() {
            var location = this.getLocation();
            this.location = location;
            this.el.className += ' ' + location;

            var iframe = document.getElementById('page');
            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            var element = innerDoc.getElementById('widget-wrapper-'+ this.model.cid);

            var offsetFrame = util.getWindowRelativeOffset(window.document, iframe);
            var offset = util.getWindowRelativeOffset(window.document, element);

            var leftDist = offset.left + offsetFrame.left;
            var topDist = offset.top + offsetFrame.top;

            switch(this.location) {
                case "right":
                    this.$el.append('<div class="left-arrow"></div>');
                    leftDist += element.getBoundingClientRect().width;
                    this.$el.addClass('fadeInRight');

                    break;
                case "bottom":
                    this.$el.append('<div class="top-arrow"></div>');
                    topDist += element.getBoundingClientRect().height;
                    this.$el.addClass('fadeInUp');

                    break;
                case "left":
                    this.$el.append('<div class="right-arrow"></div>');
                    this.$el.addClass('fadeInLeft');
                    break;
                case "top":
                    // not supposed to happen
                    break;
            }
            this.$el.show();


            this.el.style.left = leftDist + 'px';
            this.el.style.top = topDist + 'px';

            this.model.trigger('display-widget-editor');

            return this;
        },

        filleContent: function() {
            var action = "";
            if (this.model.get('data').has('container_info')) {
                action = this.model.get('data').get('container_info').get('action');

                if (action == "login" || action == "thirdpartylogin") {
                    this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                    this.layoutEditor = new WidgetLayoutEditorView(this.model);
                    this.subviews.push(this.layoutEditor);
                    this.subviews.push(this.widgetClassPickerView);

                    this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                    this.el.appendChild(this.widgetClassPickerView.el);
                    this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                    this.el.appendChild(this.renderButtonWithText('edit-login-form-btn', 'Edit Login'));
                    this.el.appendChild(this.layoutEditor.el);
                }

                if (action == "authentication" || action == "signup") {
                    this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                    this.layoutEditor = new WidgetLayoutEditorView(this.model);
                    this.subviews.push(this.layoutEditor);
                    this.subviews.push(this.widgetClassPickerView);

                    this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                    this.el.appendChild(this.widgetClassPickerView.el);
                    this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                    this.el.appendChild(this.renderButtonWithText('form-editor-btn', 'Edit Form'));
                    this.el.appendChild(this.layoutEditor.el);
                }

                if (action == "imageslider") {
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-slides-button', 'Edit Slides'));
                }

                if (action == "facebookshare") {
                    this.layoutEditor = new WidgetLayoutEditorView(this.model);
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('link-to-page-button', 'Link to A Facebook Page'));
                    this.el.appendChild(this.layoutEditor.el);
                }

                if (action == "videoembed") {
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('video-link-button', 'Change Video Content'));
                }

                if (action == "table") {
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('query-editor-btn', 'Edit Query'));
                }

                if (action == "show" || action == "loop") {
                    this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                    this.subviews.push(this.widgetClassPickerView);

                    this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                    this.el.appendChild(this.widgetClassPickerView.el);
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-row-btn', 'Edit Row'));
                    this.el.appendChild(this.renderButtonWithText('query-editor-btn', 'Edit Query'));
                    this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                }

                if (action == "searchlist") {
                    this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                    this.subviews.push(this.widgetClassPickerView);
                    this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);
                    this.el.appendChild(this.widgetClassPickerView.el);
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-row-btn', 'Edit Row'));
                    this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                }

                if (action == "searchbox") {
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('search-editor-btn', 'Edit Search Options'));
                }

                if (action == "buy") {
                    this.layoutEditor = new WidgetLayoutEditorView(this.model);
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-itemname-btn', 'Edit Item Name'));
                    this.el.appendChild(this.layoutEditor.el);
                }

                if (this.model.hasForm() && action != "login" && action != "signup") {
                    this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                    this.layoutEditor = new WidgetLayoutEditorView(this.model);

                    this.subviews.push(this.widgetClassPickerView);
                    this.subviews.push(this.layoutEditor);

                    this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('form-editor-btn', 'Edit Form'));
                    this.el.appendChild(this.layoutEditor.el);
                    this.el.appendChild(this.widgetClassPickerView.el);
                    this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                }
            } else {

                if (this.model.isCustomWidget()) {
                    this.el.appendChild(this.renderButtonWithDeleteButtonandText('edit-custom-widget-btn', 'Edit Custom Widget'));
                } else {
                    this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                    this.layoutEditor = new WidgetLayoutEditorView(this.model);
                    this.contentEditor = new WidgetContentEditorView(this.model, this);

                    this.subviews.push(this.widgetClassPickerView);
                    this.subviews.push(this.layoutEditor);
                    this.subviews.push(this.contentEditor);

                    this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);

                    this.el.appendChild(this.widgetClassPickerView.el);
                    this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
                    this.el.appendChild(this.layoutEditor.el);
                    this.el.appendChild(this.contentEditor.el);
                }
            }
        },

        renderButtonWithText: function(className, buttonText) {
            return this.renderButtonWithWidthCustomWidth(className, buttonText, 230);
        },

        renderButtonWithWidthCustomWidth: function(className, buttonText, width) {
            var li = document.createElement('ul');
            li.className = 'pad w-section section-' + className;
            li.innerHTML += '<span class="option-button tt ' + className + '" style="width:' + width + 'px; display: inline-block;">' + buttonText + '</span>';
            return li;
        },

        renderButtonWithDeleteButtonandText: function(className, buttonText) {
            var li = document.createElement('ul');
            li.className = 'w-section section-' + className;
            li.innerHTML += '<span class="' + className + '  option-button tt" style="width:190px; display: inline-block;">' + buttonText + '</span><span id="delete-widget" class="option-button delete-button tt" style="width:34px;"></span>';
            return li;
        },

        openStylePicker: function(e) {
            this.hideSubviews();
            this.widgetClassPickerView.show();
            this.widgetClassPickerView.expand();
        },

        openFormEditor: function() {
            var entityModel = this.model.get('data').get('container_info').get('form').get('entity');
            if (_.isString(entityModel)) entityModel = v1State.getTableModelWithName(entityModel);
            new FormEditorView(this.model.get('data').get('container_info').get('form'), entityModel);
        },

        openLoginEditor: function() {
            var loginRoutes = this.model.getLoginRoutes();
            new LoginFormEditorView(loginRoutes);
        },

        openSlideEditor: function() {
            new ImageSliderEditorView(this.model);
        },

        openFBShareEditor: function() {
            new FacebookShareEditor(this.model);
        },

        openVideoEmbedEditor: function() {
            new VideoEmbedEditor(this.model);
        },

        openQueryEditor: function() {
            var type = 'table';
            if (this.model.get('data').get('container_info').has('row')) {
                type = 'list';
            }

            new QueryEditorView(this.model, type);
        },

        openRowEditor: function() {
            this.hideSubviews();
            this.el.appendChild(this.renderButtonWithWidthCustomWidth('done-editing', 'Done Editing', 190));
            this.el.style.width = '200px';
            var entity = this.model.get('data').get('container_info').get('entity');
            this.listGalleryView = document.createElement('div');
            this.listGalleryView.className = 'elements-list';

            var galleryView = new RowGalleryView(this.model, this.location);
            this.subviews.push(galleryView);

            this.listGalleryView.appendChild(galleryView.render().el);
            this.el.appendChild(this.listGalleryView);
        },

        openSearchEditor: function() {
            new SearchEditorView(this.model.get('data').get('searchQuery'));
        },

        openCustomWidgetEditor: function() {
            new CustomWidgetEditorModal(this.model);
        },

        closeEditingMode: function() {
            this.$el.find('.section-done-editing').remove();
            this.el.style.width = '';
            $(this.listGalleryView).remove();
            this.showSubviews();
            this.model.trigger('editModeOff');
        },

        clickedDoneTextEditing: function() {
            this.model.trigger('stopEditing');
        },

        clickedEditItemName: function() {
            var self = this;

            var context = self.model.get('context').first().get('context');

            new GenericModelFieldEditor({

                title: "Item Name Editor",
                question: "What should show up as the name of the item on Paypal?",
                model: self.model.get('data').get('container_info'),
                key: "item_name",
                radioOptions: v1State.getTableModelWithName(self.model.get('data').get('entity')).get('fields').map(function(field) {
                    if (field.get('type') != "text") return null;
                    return {
                        text: field.get('name'),
                        val: '{{' + context + '.' + field.get('name') + '}}'
                    };
                })
            });
        },

        classChanged: function() {
            this.showSubviews();
            this.widgetClassPickerView.$el.hide();
        },

        startedEditing: function() {
            this.hideSubviews();
            this.el.appendChild(this.renderButtonWithText('done-text-editing', 'Done Editing'));
        },

        stoppedEditing: function() {
            $('.btn-toolbar').remove();
            $('.section-done-text-editing').remove();
            this.showSubviews();
        },

        clear: function() {
            if (this.contentEditor) this.contentEditor.clear();
            if (this.layoutEditor) this.layoutEditor.clear();
            if (this.infoEditor) this.infoEditor.clear();
            $('.btn-toolbar').remove();

            _(this.subviews).each(function(subview) {
                subview.close();
            });
            this.el.innerHTML = '';
            this.el.style.width = '';

            this.hide();
        },

        hide: function() {
            this.$el.removeClass('left');
            this.$el.removeClass('right');
            this.$el.removeClass('bottom');

            this.$el.removeClass('fadeInBottom');
            this.$el.removeClass('fadeInUp');
            this.$el.removeClass('fadeInLeft');
            this.$el.removeClass('fadeInRight');
            this.$el.hide();
        },

        setTempContent: function(domNode) {
            this.tempContent = domNode;
            this.hideSubviews();
            this.el.appendChild(domNode);
        },

        removeTempContent: function() {
            if(this.tempContent) this.el.removeChild(this.tempContent);
            this.showSubviews();
        },

        showSubviews: function() {
            //if(this.widgetClassPickerView) this.widgetClassPickerView.$el.fadeIn();
            if (this.contentEditor) this.contentEditor.$el.fadeIn();
            if (this.layoutEditor) this.layoutEditor.$el.fadeIn();
            if (this.infoEditor) this.infoEditor.$el.fadeIn();
            this.$el.find('.section-style-editor').fadeIn();
            this.$el.find('.section-form-editor-btn').fadeIn();
            this.$el.find('.section-query-editor-btn').fadeIn();
            this.$el.find('.section-edit-query-btn').fadeIn();
            this.$el.find('.section-edit-row-btn').fadeIn();
            this.$el.find('.section-delete-button').fadeIn();
            this.$el.find('.section-pick-style').fadeIn();
            this.$el.find('.section-edit-login-form-btn').fadeIn();
        },

        hideSubviews: function() {
            if (this.widgetClassPickerView) this.widgetClassPickerView.$el.hide();
            if (this.contentEditor) this.contentEditor.$el.hide();
            if (this.layoutEditor) this.layoutEditor.$el.hide();
            if (this.infoEditor) this.infoEditor.$el.hide();
            this.$el.find('.section-edit-login-form-btn').hide();
            this.$el.find('.section-style-editor').hide();
            this.$el.find('.section-form-editor-btn').hide();
            this.$el.find('.section-query-editor-btn').hide();
            this.$el.find('.section-edit-query-btn').hide();
            this.$el.find('.section-edit-row-btn').hide();
            this.$el.find('.section-delete-button').hide();
            this.$el.find('.section-pick-style').hide();
        },

        getLocation: function() {
            if (this.defaultLocation) return this.defaultLocation;

            var layout = this.model.get('layout');
            var rightCoor = layout.get('left') + layout.get('width');

            var pageHeight = v1State.getCurrentPage().getHeight();
            var widgetBottom = layout.get('top') + layout.get('height');

            if (widgetBottom + 8 > pageHeight) {
                if ((12 - rightCoor) < 2) return "left";
                return "right";
            }

            if (layout.get('height') < 22) {
                return "bottom";
            }

            if ((12 - rightCoor) < 2) return "left";
            return "right";
        },

        doubleClicked: function() {
            if (this.model.getForm() && !this.model.isLoginForm()) {
                this.openFormEditor();
            }
            if (this.model.getLoginRoutes()) {
                this.openLoginEditor();
            }
            if (this.model.get('type') == "imageslider") {
                this.openSlideEditor();
            }
        },

        clickedDelete: function() {
            if (this.model) {
                this.model.remove();
            }
        },

        clicked: function(e) {
            e.stopPropagation();
        },

        mousedown: function(e) {
            mouseDispatcher.isMousedownActive = true;
        },

        mouseup: function() {
            mouseDispatcher.isMousedownActive = false;
        }

    });

    return WidgetEditorView;

});