define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');

    var PluginModel = Backbone.Model.extend({

        getGeneratorsWithModule: function(moduleName) {
            if(!this.has(moduleName) || !this.has('metadata')) return [];

            var generators = _.map(this.get(moduleName), function(generator) {
                generator.generatorIdentifier = this.get('metadata').name + "."+ moduleName +"." + generator.name;
                return generator;
            }, this);
            return generators;
        },

        isBuiltIn: function() {
            return this.get('_builtin') === true;
        },

        toJSON: function() {
            var json = _.clone(this.attributes);
            _.each(json, function(gens, module) {
                _.each(gens, function(gen) {
                    if(gen.code) {
                        gen.code = gen.code.toString();
                    }
                });
            });

            return json;
        }

    });

    return PluginModel;
});
