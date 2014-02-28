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

        },

        className: "section-view",

        subviews: [],

        initialize: function(sectionModel) {
            _.bindAll(this);

            this.model = sectionModel;
            
            this.listenTo(this.model, 'remove', this.close);
            this.listenTo(this.model, 'change', this.renderContent);

            this.widgetsCollection = this.model.get('uielements');
            //this.listenTo(this.widgetsCollection, 'add', this.placeUIElement, true);

            //this.listenToModels(this.widgetsCollection, 'startEditing highlight', this.startEditing);
            //this.listenToModels(this.widgetsCollection, 'stopEditing cancelEditing', this.stopEditing);
            this.colElements = {};

        },

        render: function() {

            if($('[data-cid="'+ this.model.cid +"]")) {
                this.setElement($('[data-cid="'+ this.model.cid +'"]'), true);
            }
            else {
                var expanded = this.model.expand();
                this.setElement($(expanded.html), true);  
            }
            this.layoutElements();

            this.sectionEditorView = new SectionEditorView(this.model).render();
            this.$el.append(this.sectionEditorView.el);

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
                        this.widgetsCollection.add(widgetModel);
                    }
                    
                    widgetModel.get('layout').set('col', colKey);
                    widgetModel.get('layout').set('row', ind);

                }, this);

            }
        },

        layoutElements: function() {

            this.model.get('columns').each(function(columnModel) {

                var self = this;
                var $col = this.$el.find('[data-cid="'+columnModel.cid+'"]');
                $col.data('column', "true");
                console.log($col);

                $col.sortable({
                    connectWith: "[data-column]",
                    update: function() {
                        self.updated(key, columnModel);
                    },
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
                });

                columnModel.get('uielements').each(function(widgetModel) {
                    var widgetView = new WidgetView(widgetModel);
                    widgetView.render();
                    //$col.append(widgetView.render().el);
                });

            }, this);

        },

        placeUIElement: function(model, isNew, extraData) {
            //model.setupPageContext(v1.currentApp.getCurrentPage());

            var dict = this.model.getArrangedModels();
            var self = this;

            var col = model.get('layout').get('col');
            model.get('layout').set('row', dict[col].length);
            var $col = self.$el.find('#col'+col);

            var widgetView = new WidgetView(model);
            $col.append(widgetView.render().el);
        },

        highlightCols: function() {
            this.$el.find('.ycol').addClass("fancy-borders");
        },

        unhighlightCols: function() {
            this.$el.find('.ycol').removeClass("fancy-borders");
        },

        startEditing: function() {
            this.$el.find('.ycol.ui-sortable').each(function() {
                $(this).sortable("disable");
            });
        },

        stopEditing: function() {
            this.$el.find('.ycol').each(function() {
                if($(this).hasClass("ui-sortable")) {
                    //$(this).sortable("enable");
                }
            });
        },

        removeSection: function() {
            this.model.collection.remove(this.model);
        }

    });

    return SectionView;
});