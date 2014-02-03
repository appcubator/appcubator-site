define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');
    var GeneratorModel = Backbone.Model.extend({});
    var GeneratorCollection = Backbone.Collection.extend({ model: GeneratorModel});

    var PluginModel = Backbone.Model.extend({
        defaults: {
            address: "",
            name: "",
            generators: new GeneratorCollection(),
        },
        initialize: function(options) {
            this.set("name", options.name)
        },        
        fetchPlugin: function() {
            var name = this.get("name");
            var pluginAddress = "http://localhost:3001/package/" + name 
            $.ajax({
                url: pluginAddress,
                success: function(generators){
                    console.log(generators);
                    //this.set('modules',  generators)
                }.bind(this)
            })
        },
        serialize: function() {

        },


    });

    return PluginModel;
});