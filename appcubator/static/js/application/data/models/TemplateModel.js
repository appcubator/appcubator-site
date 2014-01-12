define(function(require, exports, module) {

    'use strict';
    require('backbone');

    var WidgetCollection = require('collections/WidgetCollection');

    var TemplateModel = Backbone.Model.extend({

        initialize: function(bone) {

            this.set('body', new WidgetCollection(bone.body));

            // _(bone.body).each(function(uielement) {
            //     if (uielement.container_info) {
            //         this.get('body').addWidgetContainerModel(uielement);
            //     } else {
            //         this.get('body').addWidgetModel(uielement);
            //     }
            // }, this);
        }
    });

    return TemplateModel;
});