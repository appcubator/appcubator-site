define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneConvenience');

    var WidgetCollection = require('collections/WidgetCollection');

    var ColumnModel = Backbone.Model.extend({

        initialize: function(bone) {
            this.set("uielements", new WidgetCollection(bone.uielements||[]));
        },

        toJSON: function(options) {
            options = options || {};

            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize(options);
            if(!options) {
                console.trace();
            }
            if(options.generate) {
                json.cid = this.cid;
            }
            return json;
        }
    });

    return ColumnModel;
});