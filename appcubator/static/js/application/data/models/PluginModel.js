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

        getGeneratorsWithModule: function(moduleName) {
            if(!this.has(moduleName)) return [];

            var uielements = _.map(this.get(moduleName), function(el) {
                el.generatorIdentifier = this.get('metadata').name + "."+ moduleName +"." + el.name;
                return el;
            }, this);
            return uielements;
        }

    });

    return PluginModel;
});
