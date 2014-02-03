define([
  'models/PluginModel'
],
function(PluginModel) {

  var PluginCollection = Backbone.Collection.extend({
    model : PluginModel,    
    initialize: function (options) {
    	this.identifier = options.identifier; // Unique identifier for plugins
    	this.modules = options.modules;
    }
  });

  return PluginCollection;
});
