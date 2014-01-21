define(function(require, exports, module) {

    'use strict';
    var NavbarModel      = require('models/NavbarModel'),
        FooterModel      = require('models/FooterModel'),
        SectionCollection= require('collections/SectionCollection');

    var TemplateModel = Backbone.Model.extend({

        initialize: function(bone) {

            this.set('name', bone.name);
            this.set('head', bone.head || "");

            console.log(bone);
            
            this.set('uielements', new SectionCollection(bone.uielements || []));
            this.set('navbar', new NavbarModel(bone.navbar || {}));
            this.set('footer', new FooterModel(bone.footer || {}));

        },

        getUIElements: function() {
            return this.get('uielements');
        },

        getSections: function() {
            return this.get('uielements');
        },

        getHeight: function() {
            var height = 0;

            // this.getUIElements().each(function(uielement) {
            //     var layout = uielement.get('layout');
            //     var bottom = layout.get('top') + layout.get('height');
            //     if (bottom > height) {
            //         height = bottom;
            //     }
            // });

            return height;
        },


        toJSON: function() {

            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize();
            json.navbar     = json.navbar.serialize();
            json.footer     = json.footer.serialize();

            return json;
        }
    });

    return TemplateModel;
});