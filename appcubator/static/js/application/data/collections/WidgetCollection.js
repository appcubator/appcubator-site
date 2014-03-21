define(function(require, exports, module) {

    'use strict';

    var WidgetModel = require("models/WidgetModel");
    var Generator = require("app/Generator")
    require("backbone");

    var WidgetCollection = Backbone.Collection.extend({

        model: WidgetModel,

        initialize: function() {
            Backbone.Regrettable.bind(this);
        },

        createElementWithGenPath: function(layout, generatorPath, type, extraData) {
            this.createUIElement(type, layout, generatorPath, extraData);
        },

        createUIElement: function(type, layout, generatorPath, extraData) {
            var generator = G.getGenerator(generatorPath);

            var widget = {};
            widget.layout = layout;
            widget.type = type;

            if (generator.defaults) {
                widget = _.extend(widget, generator.defaults);
            }
            if (extraData) {
                widget = _.extend(widget, extraData);
            }

            var widgetModel = new WidgetModel(widget);
            widgetModel.setGenerator(generatorPath);

            this.push(widgetModel);

            return widgetModel;
        }

    });

    return WidgetCollection;
});
