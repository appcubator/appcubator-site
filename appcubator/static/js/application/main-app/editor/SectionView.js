define(function(require, exports, module) {

    'use strict';

    var WidgetView = require('editor/WidgetView');
    var WidgetModel = require('models/WidgetModel');
    var SectionEditorView = require('editor/SectionEditorView');

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

        className: "section-view",

        subviews: [],

        initialize: function(sectionModel) {
            _.bindAll(this);

            this.model = sectionModel;
            
            this.listenTo(this.model, 'remove', this.close);
            this.listenTo(this.model, 'change', this.renderContent);

            this.widgetsCollection = this.model.get('uielements');
            this.listenTo(this.widgetsCollection, 'add', this.placeUIElement, true);

            this.listenToModels(this.widgetsCollection, 'startEditing', this.startEditing);
            this.listenToModels(this.widgetsCollection, 'stopEditing cancelEditing', this.stopEditing);

            this.colElements = {};

        },

        render: function() {

            this.renderContent();
            this.sectionEditorView = new SectionEditorView(this.model).render();
            this.$el.append(this.sectionEditorView.el);

            return this;
        },

        renderContent: function() {
            
            if(this.$innerEl) this.$innerEl.remove();

            var template = "";
            
            switch(this.model.get('layout')) {
                case "12":
                    template = [
                    '<div class="row <%= className %>">',
                        '<div class="container">',
                            '<div class="ycol" id="colheader"></div>',
                            '<div class="col-md-12 ycol" id="col0"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;
                case "3-3-3-3":
                    template = [
                    '<div class="row <%= className %>">',
                        '<div class="container">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-3 ycol" id="col0"></div>',
                            '<div class="col-md-3 ycol" id="col1"></div>',
                            '<div class="col-md-3 ycol" id="col2"></div>',
                            '<div class="col-md-3 ycol" id="col3"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "4-4-4":
                    template = [
                    '<div class="row <%= className %>">',
                        '<div class="container">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-4 ycol" id="col0"></div>',
                            '<div class="col-md-4 ycol" id="col1"></div>',
                            '<div class="col-md-4 ycol" id="col2"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "8-4":
                    template = [
                    '<div class="row <%= className %>">',
                        '<div class="container">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-8 ycol" id="col0"></div>',
                            '<div class="col-md-4 ycol" id="col1"></div>',
                        '</div>',
                    '</div>'].join('\n');
                    break;

                case "4-8":
                    template = [
                    '<div class="row <%= className %>">',
                        '<div class="container">',
                            '<div class="text-center ycol" id="colheader"></div>',
                            '<div class="col-md-4 ycol" id="col0"></div>',
                            '<div class="col-md-8 ycol" id="col1"></div>',
                        '</div>',
                    '</div>'].join('\n');
            }

            if(!this.model.has('className')) {
                this.model.set('className', '');
            }

            this.$innerEl = $(_.template(template, this.model.toJSON()));
            this.$el.append(this.$innerEl);
            this.layoutElements();

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
                        self.highlightCols();
                    },
                    stop: function(e, ui) {
                        self.unhighlightCols();
                    }
                }).disableSelection();

                this.colElements[key] = $col.sortable( "toArray" );

                val = _.sortBy(val, function(model) { return parseInt(model.get('layout').get('row'), 10); });
                
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

        startEditing: function() {
            this.$el.find('.ycol').each(function() {
                if($(this).hasClass("ui-sortable")) {
                    $(this).sortable("disable");
                }
            });
        },

        stopEditing: function() {
            this.$el.find('.ycol').each(function() {
                if($(this).hasClass("ui-sortable")) {
                    $(this).sortable("enable");
                }
            });
        },

        hovered: function() {
            this.model.trigger('hovered');
        },

        hoveredColumn: function(e) {
            var colId = String(e.currentTarget.id).replace('col','');
            this.currentColumn = colId;
        },

        removeSection: function() {
            this.model.collection.remove(this.model);
        }

    });

    return SectionView;
});