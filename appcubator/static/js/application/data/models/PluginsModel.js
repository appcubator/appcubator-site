define(function(require, exports, module) {

	'use strict';

	require('backbone');
	var PluginModel = require('models/PluginModel');


	/* Contains metadata and convenience methods for Plugins */
	var PluginsModel = Backbone.Model.extend({

		initialize: function(bone) {

			_.each(bone, function(val, key) {
				var pluginModel = new PluginModel(val);
				this.set(key, pluginModel);
			}, this);

		},

		install: function(plugin) {
			var pluginModel = new PluginModel(JSON.parse(plugin.data));
			pluginModel.set('metadata', {
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

		installPluginToModel: function(pluginModel, nodeModelModel) {
			if (!pluginModel) return;
			console.log(pluginModel.name);
			var gens = v1State.get('generators').get(pluginModel.name).getGeneratorsWithModule('model_methods');
			console.log(gens);

			_.each(gens, function(gen) {
				console.log(gen);
				var methodModel = new NodeModelMethodModel();
				methodModel.setGenerator(gen);
				methodModel.set('modelName', nodeModelModel.get('name'));
			});

		},

		uninstallPluginToModel: function(pluginName, nodeModelModel) {

		},

		toJSON: function() {
			var json = _.clone(this.attributes);

			_.each(json, function (val, key) {
				console.log(val);
				json[key] = val.serialize();
			});

			return json;
		}

	});

	return PluginsModel;
});