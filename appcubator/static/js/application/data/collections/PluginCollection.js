define([
  'models/PluginModel'
],
function(PluginModel) {

  var PluginCollection = Backbone.Collection.extend({
    model : PluginModel,    
    initialize: function () {

    }
  });

  return PluginCollection;
});
