define(function(require, exports, module) {

    'use strict';

    require('mixins/BackboneUI');
    require('util');

    var WidgetSettingsView = require('editor/WidgetSettingsView');
    var WidgetContentEditorView = require('editor/WidgetContentEditorView');
    var WidgetLayoutEditorView = require('editor/WidgetLayoutEditorView');
    var WidgetClassPickerView = require('editor/WidgetClassPickerView');
    var CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal');

    var WidgetEditorView = Backbone.UIView.extend({

        className: 'widget-editor animated',
        id: 'widget-editor',
        tagName: 'div',
        css: 'widget-editor',
        type: 'widget',
        subviews: [],

        events: {
            'click .settings': 'openSettingsView',
            'click .pick-style': 'openStylePicker',
            'click .done-editing': 'closeEditingMode',
            'click .delete-button': 'clickedDelete',
            'click .done-text-editing': 'clickedDoneTextEditing',
            'click .edit-custom-widget-btn': 'openCustomWidgetEditor',
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
            if (this.model) { this.unbindModel(widgetModel); }

            this.model = widgetModel;

            this.listenTo(this.model, 'startEditing', this.startedEditing);
            this.listenTo(this.model, 'stopEditing cancelEditing', this.stoppedEditing);
            this.listenTo(this.model, 'reselected', this.show);
            this.listenTo(this.model, 'deselected', this.clear);

            return this;
        },

        unbindModel: function(model) {
            this.stopListening(model, 'startEditing', this.startedEditing);
            this.stopListening(model, 'stopEditing cancelEditing', this.stoppedEditing);
            this.stopListening(model, 'reselected', this.show);
            this.stopListening(model, 'deselected', this.clear);
        },

        render: function() {
            this.hide();
            return this;
        },

        setupScrollEvents: function() {
            var self = this;
            var timer;
            $(innerDoc).bind('scroll', function() {
                clearTimeout(timer);
                timer = setTimeout(refresh, 150);
                self.hide();
            });

            var refresh = function() {
                if (!self.model) return;
                self.show();
            };

        },

        display: function() {
            if (!this.model) return;

            this.clearContent();
            this.fillContent();
            this.show();
        },

        show: function() {
            if (!this.model) return;
            this.stopListening(this.model, 'rendered', this.show);

            var location = this.getLocation();
            this.location = location;
            this.el.className += ' ' + location;

            var iframe = document.getElementById('page');
            var innerDoc = iframe.contentDocument || iframe.contentWindow.document;
            var element = $(innerDoc).find("[data-cid='" + this.model.cid + "']")[0];

            if (!element) {
                this.listenTo(this.model, 'rendered', this.show);
                return;
            }

            var offsetFrame = util.getWindowRelativeOffset(window.document, iframe);
            var offset = util.getWindowRelativeOffset(window.document, element);

            var leftDist = offset.left + offsetFrame.left;
            var topDist = offset.top + offsetFrame.top;

            this.$el.find('.arw').remove();

            switch (this.location) {
                case "right":
                    this.$el.append('<div class="left-arrow arw"></div>');
                    leftDist += element.getBoundingClientRect().width;
                    this.$el.addClass('fadeInRight');

                    break;
                case "bottom":
                    this.$el.append('<div class="top-arrow arw"></div>');
                    topDist += element.getBoundingClientRect().height;
                    this.$el.addClass('fadeInUp');

                    break;
                case "left":
                    this.$el.append('<div class="right-arrow arw"></div>');
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

        fillContent: function() {
            var action = "";
            var type = this.model.get('type');

            this.layoutEditor = new WidgetLayoutEditorView(this.model);
            this.el.appendChild(this.layoutEditor.el);

            if (this.model.has('className')) {
                this.widgetClassPickerView = new WidgetClassPickerView(this.model);
                this.listenTo(this.widgetClassPickerView, 'change', this.classChanged);
                this.el.appendChild(this.widgetClassPickerView.el);
                this.el.appendChild(this.renderButtonWithText('pick-style', 'Pick Style'));
            }

            if (this.model.has('href') || this.model.has('src')) {
                this.contentEditor = new WidgetContentEditorView(this.model, this);
                this.el.appendChild(this.contentEditor.el);
            }

            if (type == "custom-widget") {
                this.el.appendChild(this.renderButtonWithText('edit-custom-widget-btn', 'Edit Custom Widget'));
            }

            this.el.appendChild(this.renderSettingsAndDelete('edit-custom-widget-btn', 'Edit Custom Widget'));
        },

        clearContent: function() {
        	this.$el.find('.btn-toolbar').remove();

            if (this.contentEditor) {
				this.contentEditor.clear();
			}
            if (this.layoutEditor) {
            	this.layoutEditor.clear();
            }
            if (this.infoEditor) {
            	this.infoEditor.clear();
            }

            $('.btn-toolbar').remove();

            _(this.subviews).each(function(subview) {
                subview.close();
            });
            this.el.innerHTML = '';
            this.el.style.width = '';
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

        renderSettingsAndDelete: function() {
            var li = document.createElement('ul');
            li.className = 'w-section';
            li.innerHTML += '<span id="delete-widget" class="option-button delete-button tt"></span><span class="option-button tt settings"></span>';
            return li;
        },

        openStylePicker: function(e) {
            this.hideSubviews();
            this.widgetClassPickerView.show();
            this.widgetClassPickerView.expand();
        },

        openCustomWidgetEditor: function() {
            new CustomWidgetEditorModal(this.model);
        },

        openSettingsView: function() {
            new WidgetSettingsView(this.model).render();
        },

        closeEditingMode: function() {
            this.$el.find('.section-done-editing').remove();
            this.el.style.width = '';
            $(this.listGalleryView).remove();
            this.showSubviews();
            this.model.trigger('editModeOff');
            this.model.trigger('stopEditingRow');
            this.model.trigger('unhighlight');
        },

        clickedDoneTextEditing: function() {
            this.model.trigger('stopEditing');
        },

        classChanged: function() {
            this.showSubviews();
            this.widgetClassPickerView.$el.hide();
        },

        startedEditing: function() {
            if (this.editingMode) return;
            this.hideSubviews();
            this.el.appendChild(this.renderButtonWithText('done-text-editing', 'Done Editing'));
            this.editingMode = true;
        },

        stoppedEditing: function() {
            $('.btn-toolbar').remove();
            $('.section-done-text-editing').remove();
            this.showSubviews();
            this.editingMode = false;
        },

        clear: function() {
            this.clearContent();
            this.unbindModel(this.model);

            this.model = null;

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
            if (this.tempContent) this.el.removeChild(this.tempContent);
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

            return "bottom";
            // var layout = this.model.get('layout');
            // var rightCoor = layout.get('left') + layout.get('width');

            // var pageHeight = $('#page-wrapper').height();
            // var widgetBottom = layout.get('top') + layout.get('height');

            // if (widgetBottom + 8 > pageHeight) {
            //     if ((12 - rightCoor) < 2) return "left";
            //     return "right";
            // }

            // if (layout.get('height') < 22) {
            //     return "bottom";
            // }

            // if ((12 - rightCoor) < 2) return "left";
            // return "right";
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
