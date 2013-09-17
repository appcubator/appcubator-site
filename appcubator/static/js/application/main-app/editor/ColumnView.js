define(function(require, exports, module) {
    'use strict';

    var WidgetView = require('editor/WidgetView'),
        WidgetContainerView = require('editor/WidgetContainerView'),
        WidgetModel = require('models/WidgetModel'),
        WidgetEditorView = require('editor/WidgetEditorView'),
        WidgetListView = require('editor/WidgetListView'),
        WidgetFormView = require('editor/WidgetFormView'),
        WidgetCustomView = require('editor/WidgetCustomView');



        var ColumnView = Backbone.View.extend({
            className: 'column-view',
            width: 12,

            events: {
                'click': 'splitColumn',
                'mouseover': 'hovered',
                'mousemove': 'hovered',
                'mouseout': 'unhovered'
            },

            initialize: function(columnM) {
                _.bindAll(this);
                this.model = columnM;
                this.listenTo(this.model, 'change:width', this.layout);
                this.listenTo(this.model.getElements(), 'add', this.placeUIElement);
                this.subviews = [];
            },

            render: function() {
                this.el.className += (' span' + this.model.getWidth());
                return this;
            },

            layout: function() {
                console.log('layout');
                this.el.className = (this.className + ' span' + this.model.getWidth());
            },

            splitColumn: function() {
                this.model.split();
            },

            hovered: function() {
                this.model.trigger('hovered', this.model);
            },

            unhovered: function() {
                this.model.trigger('unhovered');
            },

            // this function decides if widget or container
            placeUIElement: function(model, isNew, extraData) {
                if (extraData && extraData.collection) {
                    isNew = false;
                }

                model.setupPageContext(v1State.getCurrentPage());
                var widget = {};
                if (model.get('data').has('container_info') && model.get('data').get('container_info').has('row')) {
                    widget = this.placeList(model, isNew);
                } else if (model.hasForm()) {
                    widget = this.placeForm(model, isNew);
                } else if (model.get('data').has('container_info') || model.get('data').get('action') == "thirdpartylogin") {
                    widget = this.placeContainer(model, isNew);
                } else if (model.get('type') == 'custom') {
                    widget = this.placeCustomWidget(model, isNew);
                } else {
                    widget = this.placeWidget(model, isNew);
                }

                this.el.appendChild(widget.render().el);
                this.subviews.push(widget);
                return widget;
            },

            placeWidget: function(widgetModel, isNew) {
                var curWidget = new WidgetView(widgetModel);

                // if (!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
                // else util.get('full-container').appendChild(curWidget.render().el);
                // if (isNew) curWidget.autoResize();

                return curWidget;
            },

            placeContainer: function(containerWidgetModel, isNew) {
                var curWidget = new WidgetContainerView(containerWidgetModel);
                // if (!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
                // else util.get('full-container').appendChild(curWidget.render().el);
                // if (isNew) curWidget.autoResize();
                return curWidget;
            },

            placeList: function(containerWidgetModel, isNew) {
                var curWidget = new WidgetListView(containerWidgetModel);
                // if (!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
                // else util.get('full-container').appendChild(curWidget.render().el);
                // if (isNew) curWidget.autoResize();
                return curWidget;
            },

            placeForm: function(containerWidgetModel, isNew) {
                var curWidget = new WidgetFormView(containerWidgetModel);
                // if (!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
                // else util.get('full-container').appendChild(curWidget.render().el);
                // if (isNew) curWidget.autoResize();
                return curWidget;
            },

            placeCustomWidget: function(widgetModel, isNew) {
                var curWidget = new WidgetCustomView(widgetModel);
                // this.widgetsContainer.appendChild(curWidget.render().el);
                // if (isNew) new CustomWidgetEditorModal(widgetModel);
                return curWidget;
            }

        });

        return ColumnView;
    });