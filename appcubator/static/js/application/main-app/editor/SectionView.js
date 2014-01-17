define(function(require, exports, module) {

    'use strict';
    var WidgetView = require('editor/WidgetView');
    var WidgetContainerView = require('editor/WidgetContainerView');
    var WidgetModel = require('models/WidgetModel');
    var WidgetListView = require('editor/WidgetListView');
    var WidgetFormView = require('editor/WidgetFormView');
    var WidgetCustomView = require('editor/WidgetCustomView');
    var CustomWidgetEditorModal = require('editor/CustomWidgetEditorModal');
    require('backbone');
    require('util');


    var SectionView = Backbone.View.extend({

        widgetsContainer: null,

        events: {
            'mouseover' : 'hovered'
        },

        className: "section-proto",

        subviews: [],

        initialize: function(sectionModel) {
            _.bindAll(this);

            this.model = sectionModel;

            // this.widgetsCollection = widgetsCollection;
            // this.listenTo(this.widgetsCollection, 'add', this.placeUIElement, true);


            // this.listenTo(this.widgetsCollection, 'change', function() {
            //     util.askBeforeLeave();
            // });
            // this.listenTo(this.widgetsCollection, 'add', function() {
            //     util.askBeforeLeave();
            // });
        },

        render: function() {
            switch(this.model.get('layout')) {
                case "hero":
                    this.el.innerHTML = '<div class="jumbotron"><div class="container ycol col0"></div></div>';
                    break;
                case "3-3-3-3":
                    this.el.innerHTML = [
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="text-center ycol colheader"></div>',
                            '<div class="col-md-3 ycol col0"></div>',
                            '<div class="col-md-3 ycol col1"></div>',
                            '<div class="col-md-3 ycol col2"></div>',
                            '<div class="col-md-3 ycol col3"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "4-4-4":
                    this.el.innerHTML = [
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="text-center ycol colheader"></div>',
                            '<div class="col-md-4 ycol col0"></div>',
                            '<div class="col-md-4 ycol col1"></div>',
                            '<div class="col-md-4 ycol col2"></div>',
                        '</div>',
                    '</div>'].join('\n');
            }

            this.layoutElements();
            // this.widgetsContainer = document.getElementById('elements-container');
            // this.widgetsContainer.innerHTML = '';

            // this.widgetsCollection.each(function(widget) {
            //     widget.setupPageContext(v1.currentApp.getCurrentPage());
            //     var newWidgetView = this.placeUIElement(widget, false);
            // }, this);


            return this;
        },

        layoutElements: function() {
            // colid: [els]
            var dict = this.model.getArrangedModels();
            console.log(dict);
            _.each(dict, function(val, key) {

                var $col = this.$el.find('.col'+key);
                _.each(val, function(widgetModel) {
                    var widgetView = new WidgetView(widgetModel);
                    $col.append(widgetView.render().el);
                });

            }, this);

        },

        addWidgets: function(arrWidgets) {
            widget.setupPageContext(top.v1State.getCurrentPage());
            var newWidgetView = this.placeUIElement(widget, false);
        },

        // this function decides if widget or container
        placeUIElement: function(model, isNew, extraData) {
            if (extraData && extraData.collection) {
                isNew = false;
            }

            model.setupPageContext(v1.currentApp.getCurrentPage());
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

            curWidget.delegateEvents();

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

        hovered: function() {
            this.model.trigger('hovered');
        },

        close: function() {
            WidgetManagerView.__super__.close.call(this);
        }
    });

    return SectionView;
});