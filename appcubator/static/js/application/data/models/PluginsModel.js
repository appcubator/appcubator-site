define(function(require, exports, module) {

    'use strict';

    require('backbone');
    var PluginModel = require('models/PluginModel');
    var NodeModelMethodModel = require('models/NodeModelMethodModel');

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
                name: plugin.name
            });
            this.set(plugin.name, pluginModel);
        },

        getPluginsWithModule: function(moduleName) {
            return _.filter(this.attributes, function(pluginModel, pluginName) {
                pluginModel.name = pluginName;
                return pluginModel.has(moduleName);
            });
        },

        getGeneratorsWithModule: function(generatorModule) {
            var generators = [];

            var generators = _.flatten(_.map(this.attributes, function(pluginModel, packageName) {
                return pluginModel.getGeneratorsWithModule(generatorModule);
            }));

            return generators;
        },

        isPluginInstalledToModel: function(pluginModel, nodeModelModel) {
            var gens = _.pluck(pluginModel.getGeneratorsWithModule('model_methods'), 'generatorIdentifier');
            var functions = nodeModelModel.get('functions').map(function(fn) { return fn.generate; });
            return _.intersection(gens, functions).length > 0 ? true : false;
        },

        installPluginToModel: function(pluginModel, nodeModelModel) {
            if (!pluginModel) return;
            var gens = this.get(pluginModel.name).getGeneratorsWithModule('model_methods');
            _.each(gens, function(gen) {
                var methodModel = new NodeModelMethodModel();
                methodModel.setGenerator(gen.generatorIdentifier);
                methodModel.set('modelName', nodeModelModel.get('name'));
                methodModel.set('name', gen.name);
                nodeModelModel.get('functions').push(methodModel);
            });
        },

        uninstallPluginToModel: function(plugin, nodeModelModel) {
            
            var gens = [];

            nodeModelModel.get('functions').each(function(fn) {
                if(fn.isInPackage(plugin.name)) {
                    gens.push(fn);
                }
            });

            nodeModelModel.get('functions').remove(gens);
        },

        fork: function (generator, generatorPath, newName) {

            var genObj = _.clone(generator);
            var newPath = util.packageModuleName(generatorPath);
            newPath.name = newName;
            genObj.name = newName;

            this.get(newPath.package)[newPath.module].push(genObj);

            return [newPath.package, newPath.module, newPath.name].join('.');
        },

        toJSON: function() {
            var json = _.clone(this.attributes);

            _.each(json, function (val, key) {
                json[key] = val.serialize();
            });

            return json;
        }

    });

    return PluginsModel;
});
