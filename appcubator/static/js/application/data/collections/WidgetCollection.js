define(function(require, exports, module) {

    'use strict';

    var WidgetModel = require("models/WidgetModel");
    var Generator = require("app/Generator")
    require("backbone");

        var WidgetCollection = Backbone.Collection.extend({

            model: WidgetModel,

            createElementWithGenPath: function (layout, generatorPath, type, extraData) {
                this.createUIElement(type, layout, generatorPath, extraData);
            },

            createUIElement: function (type, layout, generatorPath, extraData) {
<<<<<<< HEAD
                console.log(generatorPath);
                var generator = new Generator(generatorPath);
=======
                var generator = G.getGenerator(generatorPath);
>>>>>>> e4fa0029560ae7a7ff86d5e59b55a605d9f56618

                var widget = {};
                widget.layout = layout;
                widget.type = type;
                
                if(generator.defaults) { widget = _.extend(widget, generator.defaults); }
                if(extraData) { widget = _.extend(widget, extraData); }

                var widgetModel = new WidgetModel(widget);
                widgetModel.setGenerator(generatorPath);

                return this.push(widgetModel);
            }

        });

        return WidgetCollection;
    });
