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
            'mouseover'       : 'hovered',
            'mouseup'         : 'hovered',
            'mouseover .ycol' : 'hoveredColumn',
            'mouseup .ycol'   : 'hoveredColumn'
        },

        className: "section-proto",

        subviews: [],

        initialize: function(sectionModel) {
            _.bindAll(this);

            this.model = sectionModel;
            this.widgetsCollection = this.model.get('uielements');
            this.listenTo(this.widgetsCollection, 'add', this.placeUIElement, true);
            this.colElements = {};

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
                    this.el.innerHTML = '<div class="jumbotron"><div class="container ycol" id="col0"></div></div>';
                    break;
                case "3-3-3-3":
                    this.el.innerHTML = [
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="text-center ycol colheader"></div>',
                            '<div class="col-md-3 ycol" id="col0"></div>',
                            '<div class="col-md-3 ycol" id="col1"></div>',
                            '<div class="col-md-3 ycol" id="col2"></div>',
                            '<div class="col-md-3 ycol" id="col3"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "4-4-4":
                    this.el.innerHTML = [
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-4 ycol" id="col0"></div>',
                            '<div class="col-md-4 ycol" id="col1"></div>',
                            '<div class="col-md-4 ycol" id="col2"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "8-4":
                    this.el.innerHTML = [
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-8 ycol" id="col0"></div>',
                            '<div class="col-md-4 ycol" id="col1"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "4-8":
                    this.el.innerHTML = [
                    '<div class="container">',
                        '<div class="row">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-4 ycol" id="col0"></div>',
                            '<div class="col-md-8 ycol" id="col1"></div>',
                        '</div>',
                    '</div>'].join('\n');
            }

            this.$el.find( ".ycol" );

            this.layoutElements();
            // this.widgetsContainer = document.getElementById('elements-container');
            // this.widgetsContainer.innerHTML = '';

            // this.widgetsCollection.each(function(widget) {
            //     widget.setupPageContext(v1.currentApp.getCurrentPage());
            //     var newWidgetView = this.placeUIElement(widget, false);
            // }, this);


            return this;
        },

        updated: function(colKey, $col) {
            var curArr = $col.sortable( "toArray" );
            if(!_.isEqual(curArr, this.colElements[colKey])) {

                _.each(curArr, function(elId, ind) {
                    
                    var cid = elId.replace('widget-wrapper-','');
                    var widgetModel = {};

                    if (this.widgetsCollection.get(cid)) {
                        widgetModel = this.widgetsCollection.get(cid);
                    }
                    else {
                        var coll = v1.currentApp.view.sectionsCollection.getAllWidgets();
                        widgetModel = coll.get(cid);
                        widgetModel.collection.remove(widgetModel);
                        this.collection.add(widgetModel);
                    }
                    
                    widgetModel.get('layout').set('col', colKey);
                    widgetModel.get('layout').set('row', ind);

                }, this);

            }
        },

        layoutElements: function() {
            // colid: [els]
            var dict = this.model.getArrangedModels();

            _.each(dict, function(val, key) {

                var self = this;
                var $col = this.$el.find('#col'+key);

                $col.sortable({
                    connectWith: ".ycol",
                    update: function() {
                        self.updated(key, $col);
                    },
                    containment: document.firstChild,
                    sort: function(e, ui) {
                        var amt = $(window).scrollTop();
                        ui.position.top += amt;
                    },
                    start: function(e, ui) {
                        // console.log(ui);
                        // var amt = $(window).scrollTop();
                        // ui.position.top += amt;
                        // console.log(amt);
                        // console.log(ui);
                        self.highlightCols();
                    },
                    stop: function(e, ui) {
                        self.unhighlightCols();
                    }
                }).disableSelection();

                this.colElements[key] = $col.sortable( "toArray" );

                val = _.sortBy(val, function(model) { return parseInt(model.get('layout').get('row')); });
                
                _.each(val, function(widgetModel) {
                    var widgetView = new WidgetView(widgetModel);
                    $col.append(widgetView.render().el);
                });

            }, this);

        },

        placeUIElement: function(model, isNew, extraData) {
            //model.setupPageContext(v1.currentApp.getCurrentPage());

            var dict = this.model.getArrangedModels();
            var self = this;

            setTimeout(function() {
                model.get('layout').set('col', self.currentColumn);
                model.get('layout').set('row', dict[self.currentColumn].length);

                var $col = self.$el.find('#col'+self.currentColumn);
                var widgetView = new WidgetView(model);
                $col.append(widgetView.render().el);

            }, 200);

        },

        highlightCols: function() {
            this.$el.find('.ycol').addClass("fancy-borders");
        },

        unhighlightCols: function() {
            this.$el.find('.ycol').removeClass("fancy-borders");
        },

        hovered: function() {
            this.model.trigger('hovered');
        },

        hoveredColumn: function(e) {
            var colId = String(e.currentTarget.id).replace('col','');
            this.currentColumn = colId;
        },

        close: function() {
            WidgetManagerView.__super__.close.call(this);
        }
    });

    return SectionView;
});