define(function(require, exports, module) {

    'use strict';
    var SectionModel = require('models/SectionModel');
    var WidgetCollection = require('collections/WidgetCollection');
    var ColumnModel = require('models/ColumnModel');

    var SectionCollection = Backbone.Collection.extend({

        model: SectionModel,

        initialize: function() {
            Backbone.Regrettable.bind(this);

            if(!this.generate) {
                this.setGenerator('templates.layoutSections');
            }
        },

        createSectionWithType: function(type) {
            var sectionsLayouts = type.split('-');
            var sectionModel = new SectionModel();

            _.each(sectionsLayouts, function(columnLayout) {
                var columnM = new ColumnModel();
                columnM.set('layout', columnLayout);
                sectionModel.get('columns').push(columnM);
            }, this);

            this.add(sectionModel);
        },

        getAllWidgets: function(argument) {
            if (!this.allWidgets) this.allWidgets = this.constructWidgetCollection();
            return this.allWidgets;
        },

        arrangeSections: function(fromInd, toInd) {
            this.models.splice(toInd, 0, this.models.splice(fromInd, 1)[0]);
            this.trigger('rearranged');
        },

        constructWidgetCollection: function() {
            var widgetCollection = new WidgetCollection();

            this.each(function(sectionModel) {
                var collection = sectionModel.get('columns');
                collection.each(function(columnModel) {

                    var widgetColl = columnModel.get('uielements');
                    widgetCollection.add(widgetColl.models);
                    widgetColl.on('add', function(model) {
                        widgetCollection.add(model);
                    });

                });
            }, this);

            this.on('add', function(sectionModel) {
                var collection = sectionModel.get('columns');
                collection.each(function(columnModel) {

                    var widgetColl = columnModel.get('uielements');
                    widgetCollection.add(widgetColl.models);
                    widgetColl.on('add', function(model) {
                        widgetCollection.add(model);
                    });

                });
            });

            /* TODO: go one level deeper on listening */

            return widgetCollection;
        }
    });

    return SectionCollection;
});
