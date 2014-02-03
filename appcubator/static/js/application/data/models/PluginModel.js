define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');
    var GeneratorModel = Backbone.Model.extend({});
    var GeneratorCollection = Backbone.Collection.extend({ model: GeneratorModel});

    var PluginModel = Backbone.Model.extend({
        defaults: {
        },
        initialize: function(options) {

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
        enablePlugin: function(){
            console.log("Enabling Plugin" + this.get('pluginInformation').name);
            var pluginInfo = this.get("pluginInformation");
            pluginInfo.enabled = true;
            this.set('pluginInformation', pluginInfo);
        },
        disablePlugin: function(){
            console.log("Disabling Plugin" + this.get('pluginInformation').name);
            var pluginInfo = this.get("pluginInformation");
            pluginInfo.enabled = false;
            this.set('pluginInformation', pluginInfo);
        },  
        getPluginStatus: function(){
            return this.get('pluginInformation').enabled;
        }      

    });

    return PluginModel;
});