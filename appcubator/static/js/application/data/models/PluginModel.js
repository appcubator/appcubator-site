define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');
    var GeneratorModel = Backbone.Model.extend({});
    var GeneratorCollection = Backbone.Collection.extend({
        model: GeneratorModel
    });

    var PluginModel = Backbone.Model.extend({
        defaults: {},

        initialize: function(options) {

        },

        fetchPlugin: function() {
            var name = this.get("name");
            var pluginAddress = "http://localhost:3001/package/" + name;
            $.ajax({
                url: pluginAddress,
                success: function(generators) {
                    console.log(generators);
                    //this.set('modules',  generators)
                }.bind(this)
            });
        },

        getGeneratorsWithModule: function(moduleName) {
            if(!this.has(moduleName)) return [];

            var uielements = _.map(this.get(moduleName), function(el) {
                el.generatorIdentifier = this.get('metadata').name + ".uielements." + el.name;
                return el;
            }, this);
            return uielements;
        }

    });

    return PluginModel;
});