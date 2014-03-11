define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');

    var PluginModel = Backbone.Model.extend({

        getName: function() {
            return this.get('metadata').name;
        },

        getGensByModule: function (moduleName) {
            if (moduleName === 'metadata') throw 'metadata is not a module';
            if (this.has(moduleName))
                return this.get(moduleName);
            else
                return [];
        },

    });

    return PluginModel;
});
