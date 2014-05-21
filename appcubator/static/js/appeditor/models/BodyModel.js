define(function(require, exports, module) {

    require('backbone');

    var BodyModel = Backbone.Model.extend({
        
        initialize: function(bone) {
            this.set("uielements", new WidgetCollection(bone.uielements || []));
        },

        toJSON: function() {

            var json = _.clone(this.attributes);
            json.uielements = json.uielements.serialize();

            return json;
        }
    });

    return BodyModel;
});