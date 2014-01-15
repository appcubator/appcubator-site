define(function(require, exports, module) {

    require('backbone');

    var WidgetCollection = require('collections/WidgetCollection'),
        NavbarModel      = require('models/NavbarModel'),
        FooterModel      = require('models/FooterModel');

    var BodyModel = Backbone.Model.extend({
        
        initialize: function(bone) {
            this.set("navbar", new NavbarModel(bone.navbar || {}));
            this.set("footer", new FooterModel(bone.footer || {}));
            this.set("uielements", new WidgetCollection(bone.uielements || []));
        },

        toJSON: function() {

            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize();
            json.navbar     = json.navbar.serialize();
            json.footer     = json.footer.serialize();

            return json;
        }
    });

    return BodyModel;
});