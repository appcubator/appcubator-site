define([
		'models/PluginModel',
		'backbone'
	],
	function(PluginModel) {

		var PluginsModel = Backbone.Model.extend({

			initialize: function(bone) {

				_.each(bone, function(val, key) {
					var pluginModel = new PluginModel(val);
					this.set(key, pluginModel);
				}, this);

			},

			install: function(plugin) {
				var pluginModel = new PluginModel(JSON.parse(plugin.data));

				pluginModel.set('pluginInformation', {
					description: plugin.description,
					name: plugin.name,
					origin: "appcubator"
				});

				this.set(plugin.name, pluginModel);
			},

			getPluginNamesWithModule: function(moduleName) {
				return _.map(this.attributes, function(pluginModel, pluginName) {
					pluginModel.name = pluginName;
					return pluginModel;
				});
			},

			getGeneratorsWithModule: function(generatorModule) {
				var generators = [];

				var generators = _.flatten(_.map(this.attributes, function(pluginModel, packageName) {
					return pluginModel.getGeneratorsWithModule(generatorModule);

					// _.each(packageContent[generatorModule], function(generator) {
					// 	generators.push({
					// 		package: packageName,
					// 		module: generatorModule,
					// 		name: generator.name
					// 	});
					// });
				}));

				return generators;
			},

			toJSON: function() {
				var json = _.clone(this.attributes);
				
				_.each(json, function(val, key) {
					json[key] = val.serialize();
				});

				return json;
			}

		});

		return PluginsModel;
	});