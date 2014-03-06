define(function(require, exports, module) {

    'use strict';

    var WidgetView = require('editor/WidgetView');
    var WidgetModel = require('models/WidgetModel');

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

            this.widgetsCollection = this.model.getWidgetsCollection();

            this.listenTo(this.widgetsCollection, 'add', this.placeUIElement, true);
            this.listenToModels(this.widgetsCollection, 'startEditing highlight', this.startEditing);
            this.listenToModels(this.widgetsCollection, 'stopEditing cancelEditing unhighlight', this.stopEditing);
            this.colElements = {};

        },

        render: function() {
            console.log($("[data-cid='"+ this.model.cid +"']"));
            if($("[data-cid='"+ this.model.cid +"']").length) {
                this.setElement($('[data-cid="'+ this.model.cid +'"]'), true);
            }
            else {
                console.log(this.model);
                var expanded = this.model.expand();
                console.log(expanded);
                this.setElement($(expanded.html), true);
            }
            this.layoutElements();

            return this;
        },

        updated: function(columnModel, $col) {
            var newArr = $col.sortable( "toArray", {attribute  : "data-cid"});
            var curArr = _(columnModel.get('uielements').models).pluck('cid');

            if(!_.isEqual(curArr, newArr)) {

                _.each(newArr, function(elCid, ind) {

                    var widgetModel = {};

                    if (columnModel.get('uielements').get(elCid)) {
                        widgetModel = this.widgetsCollection.get(elCid);
                    }
                    else {
                        var coll = v1.currentApp.view.sectionsCollection.getAllWidgets();
                        widgetModel = coll.get(elCid);
                        widgetModel.collection.remove(widgetModel, { silent: true });
                        columnModel.get('uielements').add(widgetModel, { silent: true });
                    }

                }, this);

            }
        },

        layoutElements: function() {
            if (!this.model.has('columns')) return;
            this.model.get('columns').each(function(columnModel) {

                var self = this;
                var $col = this.$el.find('[data-cid="'+columnModel.cid+'"]');
                $col.attr('data-column', "true");
                $col.sortable({
                    connectWith: "[data-column]",
                    update: function() {
                        self.updated(columnModel, $col);
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

        placeUIElement: function(model, widgetsCollection, columnModel) {

            var widgetView = new WidgetView(model).render();
            var $col = this.$el.find('[data-cid="'+columnModel.cid+'"]');
            $col.append(widgetView.el);

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
                    $(this).sortable("enable");
                }
            });
        },

        removeSection: function() {
            this.model.collection.remove(this.model);
        }

    });

    return SectionView;
});
