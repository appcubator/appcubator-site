define([
		'models/PluginModel'
	],
	function(PluginModel) {

		var PluginCollection = Backbone.Collection.extend({

			model: PluginModel,
			
			initialize: function() {

			},

			install: function (plugin) {
	 			var pluginModel = new PluginModel(JSON.parse(plugin.data));
	            
	            pluginModel.set('pluginInformation', {
	                description: plugin.description,
	                name: plugin.name,
	                origin: "appcubator"
	            });

	      	    this.add(pluginModel);
	      	    pluginModel.enablePlugin();
			}
		});

		return PluginCollection;
	});