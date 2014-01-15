define(function(require, exports, module) {

    'use strict';
    var BodyModel = require('models/BodyModel');

    var TemplateModel = Backbone.Model.extend({

        initialize: function(bone) {

            this.set('name', bone.name);
            this.set('head', bone.head||"");
            this.set('body', new BodyModel(bone.body||{}));

            //new WidgetCollection(bone.body||{}));

            // _(bone.body).each(function(uielement) {
            //     if (uielement.container_info) {
            //         this.get('body').addWidgetContainerModel(uielement);
            //     } else {
            //         this.get('body').addWidgetModel(uielement);
            //     }
            // }, this);
        },

        toJSON: function() {

            var json = _.clone(this.attributes);
            json.body = json.body.serialize();

            return json;
        }
    });

    return TemplateModel;
});