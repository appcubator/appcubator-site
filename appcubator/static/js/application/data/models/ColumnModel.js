define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneConvenience');

    var ColumnModel = Backbone.Model.extend({

        initialize: function(bone) {
            var bone = bone || {};
            var WidgetCollection = require('collections/WidgetCollection');
            this.set("uielements", new WidgetCollection(bone.uielements||[]));

            if (!this.generate) {
                this.generate = "templates.layoutColumn";
            }

            Backbone.Regrettable.bind(this);
        },

        addElement: function(type, extraData) {
            var layout = {  };
            this.get('uielements').createElement(layout, className, id);
        },

        addElementWithPath: function (type, generatorPath, extraData) {
            var layout = {  };
            this.get('uielements').createElementWithGenPath(layout, generatorPath, type, extraData);
        },

        toJSON: function(options) {
            options = options || {};

            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize(options);
            if(options.generate) {
                json.cid = this.cid;
            }
            return json;
        }
    });

    return ColumnModel;
});
