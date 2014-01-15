define(function(require, exports, module) {

    'use strict';
    var BodyModel = require('models/BodyModel');

    var TemplateModel = Backbone.Model.extend({

        initialize: function(bone) {

            this.set('name', bone.name);
            this.set('head', bone.head || "");
            this.set('body', new BodyModel(bone.body || {}));

        },

        getUIElements: function() {
            return this.get('body').get('uielements');
        },

        getHeight: function() {
            var height = 0;

            this.getUIElements().each(function(uielement) {
                var layout = uielement.get('layout');
                var bottom = layout.get('top') + layout.get('height');
                if (bottom > height) {
                    height = bottom;
                }
            });

            return height;
        },


        toJSON: function() {

            var json = _.clone(this.attributes);
            json.body = json.body.serialize();

            return json;
        }
    });

    return TemplateModel;
});