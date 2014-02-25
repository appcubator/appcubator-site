define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');

    var PluginModel = Backbone.Model.extend({

        getGeneratorsWithModule: function(moduleName) {
            if(!this.has(moduleName)) return [];

            var generators = _.map(this.get(moduleName), function(generator) {
                generator.generatorIdentifier = this.get('metadata').name + "."+ moduleName +"." + generator.name;
                return generator;
            }, this);
            return generators;
        },

        isBuiltIn: function() {
            return this.get('_builtin') === true;
        },

    });

    return PluginModel;
});
