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

        createSectoinWithType: function(type) {


            var sampleHeader = function(col) {

                return {
                    "generate": "uielements.design-header",
                    "data": {
                        "type": "header",
                        "content": "Instructors",
                        "layout": {
                            "col": col
                        },
                        "className": "",
                        "style": ""
                    }
                };

            };

            var sampleImage = function(col) {

                return {
                    "generate": "uielements.design-image",
                    "data": {
                        "type": "image",
                        "src": "http://stuco.conciergeent.com/dist/img/rishabh-photo.png",
                        "layout": {
                            "row": 1,
                            "col": col
                        },
                        "className": "img-rounded",
                        "style": "width: 140px; height: 140px;"
                    }
                };

            };

            var sampleText = function(col) {

                return {
                    "generate": "uielements.design-text",
                    "data": {
                        "type": "text",
                        "content": "I am a senior from CIT who has been DJing since my Freshman Year. Involved with both the American and Indian scene, I've opened for Lupe Fiasco, DJed at 2 Carnival Parties with Steve and have worked with Pranesh to make mixtapes and DJ Live. I made the BIB Mixtape for 2 consecutive years.",
                        "layout": {
                            "row": 2,
                            "col": col
                        },
                        "style": "",
                        "class_name": ""
                    }
                };

            };

            switch (type) {
                case "12":
                    this.add({
                        "layout": "12",
                        "className": "jumbotron",
                        "uielements": [sampleHeader("header"), sampleText(0)]
                    });
                    break;

                case "3-3-3-3":
                    this.add({
                        "layout": "3-3-3-3",
                        "className": "",
                        "uielements": [sampleHeader("header"), sampleImage(0), sampleImage(1), sampleImage(2), sampleImage(3)]
                    });
                    break;

                case "4-4-4":
                    this.add({
                        "layout": "4-4-4",
                        "className": "",
                        "uielements": [sampleHeader("header"), sampleText(0), sampleText(1), sampleText(2)]
                    });
                    break;

                case "8-4":
                    this.add({
                        "layout": "8-4",
                        "className": "",
                        "uielements": [sampleText(0), sampleImage(1)]
                    });
                    break;

                case "4-8":
                    this.add({
                        "layout": "4-8",
                        "className": "",
                        "uielements": [sampleImage(0), sampleText(1)]
                    });
                    break;
            }

        },

        getAllWidgets: function(argument) {
            if (!this.allWidgets) this.allWidgets = this.constructWidgetCollection();
            return this.allWidgets;
        },

        constructWidgetCollection: function() {
            var widgetCollection = new WidgetCollection();
            
            this.each(function(sectionModel) {
                var collection = sectionModel.get('uielements');
                widgetCollection.add(collection.models);
                collection.on('add', function(model) {
                    widgetCollection.add(model);
                });
            }, this);

            this.on('add', function(sectionModel) {
                var collection = sectionModel.get('uielements');
                widgetCollection.add(collection.models);
                collection.on('add', function(model) {
                    widgetCollection.add(model);
                });
            });

            return widgetCollection;
        }
    });

    return SectionCollection;
});