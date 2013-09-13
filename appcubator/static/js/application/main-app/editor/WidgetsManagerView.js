define(function(require, exports, module) {
    'use strict';

    var WidgetView = require('editor/WidgetView'),
        WidgetContainerView = require('editor/WidgetContainerView'),
        WidgetModel = require('models/WidgetModel'),
        WidgetEditorView = require('editor/WidgetEditorView'),
        WidgetListView = require('editor/WidgetListView'),
        WidgetFormView = require('editor/WidgetFormView'),
        WidgetSelectorView = require('editor/WidgetSelectorView'),
        WidgetCustomView = require('editor/WidgetCustomView'),
        CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal'),
        WideRowView = require('editor/WideRowView');



    var WidgetManagerView = Backbone.View.extend({
        el: document.getElementById('full-container'),
        widgetsContainer: null,
        events: {

        },
        subviews: [],

        initialize: function(rowsCollection) {
            _.bindAll(this);

            var self = this;
            this.subviews = [];

            this.rowsCollection = rowsCollection;
            this.listenTo(this.rowsCollection, 'add', this.placeRow, true);

            //this.widgetSelectorView = new WidgetSelectorView(this.widgetsCollection);

            this.listenTo(this.rowsCollection, 'change', function() {
                util.askBeforeLeave();
            });
            this.listenTo(this.rowsCollection, 'add', function() {
                util.askBeforeLeave();
            });
        },

        render: function() {
            //this.widgetsContainer = document.getElementById('elements-container');
            //this.widgetsContainer.innerHTML = '';
            this.rowsCollection.each(function(rowM) {
                //widget.setupPageContext(v1State.getCurrentPage());
                var newRow = this.placeRow(rowM, false);
            }, this);
            //this.widgetSelectorView.setElement(this.widgetsContainer).render();
        },

        placeRow: function(rowM) {
            var rowView = new WideRowView(rowM);
            this.el.appendChild(rowView.render().el);

            this.subviews.push(rowView);
        },

        addWidgets: function(arrWidgets) {
            widget.setupPageContext(v1State.getCurrentPage());
            var newWidgetView = this.placeUIElement(widget, false);
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

            this.subviews.push(widget);
            return widget;
        },

        placeWidget: function(widgetModel, isNew) {
            var curWidget = new WidgetView(widgetModel);

            if (!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
            else util.get('full-container').appendChild(curWidget.render().el);
            if (isNew) curWidget.autoResize();

            return curWidget;
        },

        placeContainer: function(containerWidgetModel, isNew) {
            var curWidget = new WidgetContainerView(containerWidgetModel);
            if (!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
            else util.get('full-container').appendChild(curWidget.render().el);
            if (isNew) curWidget.autoResize();
            return curWidget;
        },

        placeList: function(containerWidgetModel, isNew) {
            var curWidget = new WidgetListView(containerWidgetModel);
            if (!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
            else util.get('full-container').appendChild(curWidget.render().el);
            if (isNew) curWidget.autoResize();
            return curWidget;
        },

        placeForm: function(containerWidgetModel, isNew) {
            var curWidget = new WidgetFormView(containerWidgetModel);
            if (!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
            else util.get('full-container').appendChild(curWidget.render().el);
            if (isNew) curWidget.autoResize();
            return curWidget;
        },

        placeCustomWidget: function(widgetModel, isNew) {
            var curWidget = new WidgetCustomView(widgetModel);
            this.widgetsContainer.appendChild(curWidget.render().el);
            if (isNew) new CustomWidgetEditorModal(widgetModel);
            return curWidget;
        },

        close: function() {
            this.widgetSelectorView.close();
            WidgetManagerView.__super__.close.call(this);
        }
    });

    return WidgetManagerView;
});