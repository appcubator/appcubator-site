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

        getAllPlugins: function() {
            var json = _.clone(this.attributes);

            _.each(G.expander.builtinGenerators, function(val, key) {
                //val._builtin = true; // prevents serialization

                var pluginModel = new PluginModel(val);
                
                if (json[key]) {

                    _.each(val, function(gens, module) {

                        if (!json[key].has(module)) {
                            json[key].set(module, gens);
                        }
                        else {
                            json[key].set(module, _.union(json[key].get(module), gens));
                        }
                    });

                }
                else {
                    json[key] = pluginModel;
                }
            });

            return json;
        },

        install: function(plugin) {
            if (!plugin.metadata || !plugin.metadata.name)
                alert('not installing because this plugin doesn\'t have metadata.');
            var pluginModel = new PluginModel(plugin);
            this.set(plugin.metadata.name, pluginModel);
        },

        uninstall: function(pluginName) {
            this.unset(pluginName);
            // TODO do something about generator references to this plugin?
            // var plugin = this.findByName(pluginName);
        },

        findByName: function(name) {
            var searchCandidates = _.filter(this.attributes, function(pluginModel, pluginName) {
                return pluginName === name;
            });
            if (searchCandidates.length == 0)
                return undefined;
            else if (searchCandidates.length == 1)
                return searchCandidates[0];
            else {
                alert('impossible: two plugins found with the same name');
            }
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
                /* gen.generatorIdentfier is a key set only when you use getGeneratorsWithModule. */
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

        fork: function (generatorPath, newName) {
            var generator = G.getGenerator(generatorPath);
            var genObj = _.clone(generator);

            var newPath = util.packageModuleName(generatorPath);
            newPath.name = newName;
            genObj.name = newName;

            if (!this.has(newPath.package)) {
                this.set(newPath.package, new PluginModel());
            }

            if (!this.get(newPath.package).has(newPath.module)) {
                this.get(newPath.package).set(newPath.module, []);
            }

            this.get(newPath.package).get(newPath.module).push(genObj);

            return [newPath.package, newPath.module, newPath.name].join('.');
        },

        isNameUnique: function(newPackageModuleName) {

            var plugin = this.get(newPackageModuleName.package);
            if (!plugin) return true;

            var module = plugin.get(newPackageModuleName.module);
            if (!module) return true;

            if (module[newPackageModuleName.name]) {
                return false;
            }

            return true;
        },

        toJSON: function() {
            var json = _.clone(this.attributes);

            _.each(json, function (val, key) {
                // don't store the builtin generators in the app state
                if (val.isBuiltIn()) {
                    delete json[key];
                } else {
                    json[key] = val.serialize();
                }
            });

            return json;
        }

    });

    return PluginsModel;
});
