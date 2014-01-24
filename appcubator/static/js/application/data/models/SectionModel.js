define(function(require, exports, module) {

    'use strict';

    require('backbone');

    var WidgetCollection = require('collections/WidgetCollection');

    var SectionModel = Backbone.Model.extend({
        initialize: function(bone) {
            this.set("uielements", new WidgetCollection(bone.uielements || {}));
        },

        getArrangedModels: function() {

            var els = {};

            this.get('uielements').each(function(widgetModel) {

                var key = widgetModel.get('layout').get('col');

                els[key] = els[key] || [];
                els[key].push(widgetModel);

            });

            return els;
        },

        addElement: function(colId, id, className) {
            var layout = { col: colId };
            this.get('uielements').createElement(layout, className, id);
        },

        toJSON: function() {
            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize();
            return json;
        }
    });

    return SectionModel;
});