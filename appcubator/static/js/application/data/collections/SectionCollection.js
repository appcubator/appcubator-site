define(function(require, exports, module) {

    'use strict';
    var SectionModel = require('models/SectionModel');
    var WidgetCollection = require('collections/WidgetCollection');

    var SectionCollection = Backbone.Collection.extend({

        model: SectionModel,

        initialize: function() {
            
            if(!this.generate) {
                this.setGenerator('templates.layoutSections');
            }
        },

        createSectionWithType: function(type) {

        },

        getAllWidgets: function(argument) {
            if (!this.allWidgets) this.allWidgets = this.constructWidgetCollection();
            return this.allWidgets;
        },

        constructWidgetCollection: function() {
            var widgetCollection = new WidgetCollection();

            this.each(function(sectionModel) {
                var collection = sectionModel.get('columns');
                collection.each(function(columnModel) {
                    console.log(columnModel);
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
