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

            console.log(this);
        },

        getUIElements: function() {
            return this.get('uielements');
        },

        getSections: function() {
            return this.get('uielements');
        },

        toJSON: function(options) {

            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize(options);
            json.navbar     = json.navbar.serialize(options);
            json.footer     = json.footer.serialize(options);

            return json;
        }
    });

    return TemplateModel;
});