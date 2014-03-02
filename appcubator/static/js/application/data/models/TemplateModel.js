define(function(require, exports, module) {

    'use strict';
    var NavbarModel      = require('models/NavbarModel'),
        FooterModel      = require('models/FooterModel'),
        SectionCollection= require('collections/SectionCollection');

    var TemplateModel = Backbone.Model.extend({

        initialize: function(bone) {
            this.set('name', bone.name);
            this.set('head', bone.head || "");
            this.set('uielements', new SectionCollection(bone.uielements || []));
            this.set('navbar', new NavbarModel(bone.navbar || {}));
            this.set('footer', new FooterModel(bone.footer || {}));
        },

        getSections: function() {
            return this.get('uielements');
        },

        getUIElements: function() {
            if(this.widgetsCollection) return this.widgetsCollection;

            var WidgetCollection = require('collections/WidgetCollection');
            var sections = this.getSections();
            this.widgetsCollection = new WidgetCollection();

            sections.each(function(sectionModel) {
                this.widgetsCollection.add(sectionModel.getWidgetsCollection().models);
                // this.bindColumn(columnModel);
            }, this);

            //this.get('columns').on('add', this.bindColumn);

            return this.widgetsCollection;

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
