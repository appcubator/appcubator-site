define(function(require, exports, module) {

    'use strict';

    require('backbone');
    var PluginModel = require('models/PluginModel');
    var NodeModelMethodModel = require('models/NodeModelMethodModel');

    /* Contains metadata and convenience methods for Plugins */
    var PluginsModel = Backbone.Model.extend({

        initialize: function(bone) {

            _.each(bone, function(val, key) {

                /* Help initialize plugins that don't have proper metadata. */
                /* TODO put this in the initialize method of the PluginModel instead. */
                val.metadata = val.metadata || {};
                val.metadata.name = val.metadata.name || key;

                var pluginModel = new PluginModel(val);
                this.set(key, pluginModel);
            }, this);

        },

        /* builtin plugins are not in the model by default,
         * so this fn includes them in its return value 
         * 
         * returns { pluginName1: plugingModel1, ... } */
        getAllPlugins: function() {

            var plugins = {};
            plugins = _.extend(plugins, _.clone(this.attributes)); // pluginName : pluginModel object

            /* Start with local plugins and merge builtin plugins in, not overwriting local plugins. */

            _.each(G.expander.builtinGenerators, function(builtInPlugin, pluginName) {
                var pluginModel = new PluginModel(builtInPlugin);

                if (!plugins[pluginName]) {
                    plugins[pluginName] = pluginModel;
                } else {
                    /* User might have forked a generator from a builtin plugin */
                    var localCopy = new PluginModel();

                    // app-state copy of the package 
                    _.each(plugins[pluginName].attributes, function(val, key) {
                        localCopy.set(key, _.clone(val));
                    }); 

                    // iterating over the builtin ones and mergins the gens
                    _.each(builtInPlugin, function(gens, moduleName) {
                        if (moduleName === 'metadata')
                            return;
                        if(!localCopy.has(moduleName)) {
                            localCopy.set(moduleName, gens);
                        } else {
                            localCopy.set(moduleName, _.union(localCopy.get(moduleName), gens));
                        }
                    });

                    plugins[pluginName] = localCopy;
                }
            });

            return plugins;
        },

        getAllPluginsSerialized: function() {
            var plugins = this.getAllPlugins();
            var serializedPlugins = {};

            _.each(plugins, function(val, key) {
                serializedPlugins[key] = val.serialize();
            });

            return util.deepCopy(serializedPlugins);
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
        },

        getPluginsWithModule: function(moduleName) {
            return _.filter(this.getAllPlugins(), function(pluginModel, pluginName) {
                pluginModel.name = pluginName;
                return pluginModel.has(moduleName);
            });
        },

        getAllPluginsWithModule: function(moduleName) {
            var plugins = this.getAllPlugins();
            return _.filter(plugins, function(pluginModel) {
                return pluginModel.has(moduleName);
            });
        },

        getGeneratorsWithModule: function(generatorModule) {
            var generators = _.flatten(_.map(this.getAllPlugins(), function(pluginModel, packageName) {
                return pluginModel.getGensByModule(generatorModule);
            }));

            return generators;
        },

        getAllGeneratorsWithModule: function(moduleName) {
            var plugins = this.getAllPluginsWithModule(moduleName);
            plugins = _.filter(plugins, function(pluginModel, key) {
                return pluginModel.has(moduleName);
            });

            var generators = _.flatten(_.map(plugins, function(pluginModel) {
                var gens = pluginModel.get(moduleName);
                _.each(gens, function(gen) { gen.package = pluginModel.getName(); });
                return gens;
            }));

            return generators;
        },

        isPluginInstalledToModel: function(pluginModel, nodeModelModel) {
            var gens = pluginModel.getGensByModule('model_methods');
            var genNames = _.map(gens, function(g) { return pluginModel.getName() + '.model_methods.' + g.name; });
            var functions = nodeModelModel.get('functions').map(function(fn) { return fn.generate; });
            return _.intersection(genNames, functions).length > 0 ? true : false;
        },

        installPluginToModel: function(pluginModel, nodeModelModel) {
            if (!pluginModel) {
                alert('yo, what are you doing.');
                return;
            }
            var gens = pluginModel.getGensByModule('model_methods');

            _.each(gens, function(gen) {
                var methodModel = new NodeModelMethodModel();
                var genIDStr = pluginModel.getName() + '.model_methods.' + gen.name;
                methodModel.setGenerator(genIDStr);
                methodModel.set('modelName', nodeModelModel.get('name'));
                methodModel.set('name', gen.name);
                nodeModelModel.get('functions').push(methodModel);
            });
        },

        uninstallPluginToModel: function(plugin, nodeModelModel) {
            var gens = [];

            nodeModelModel.get('functions').each(function(fn) {
                if(fn.isInPackage(plugin.getName())) {
                    gens.push(fn);
                }
            });

            nodeModelModel.get('functions').remove(gens);
        },

        fork: function (generatorPath, newName) {
            var generator = G.getGenerator(generatorPath);
            var genObj = _.clone(generator);

            var genID = util.packageModuleName(generatorPath);
            genID.name = newName;
            genObj.name = newName;

            if (!this.has(genID.package)) {
                // NOTE this only happens when builtin generator is forked
                this.set(genID.package, new PluginModel({metadata: {name: genID.package}}));
            }

            if (!this.get(genID.package).has(genID.module)) {
                // NOTE this only happens when builtin generator is forked
                this.get(genID.package).set(genID.module, []);
            }

            this.get(genID.package).get(genID.module).push(genObj);

            this.trigger('fork');

            return [genID.package, genID.module, genID.name].join('.');
        },

        assertWeHaveGenerator: function(generatorPath) {
            // ensures the plugin is either builin or in the app state
                // throws an error if for some reason the generatorPath refers to a nonexistant generator
            util.findGenerator(this.serialize(), generatorPath);
        },

        isGeneratorBuiltin: function(generatorPath) {
            this.assertWeHaveGenerator(generatorPath);

            var genID = util.packageModuleName(generatorPath);

            // no generator of this package has not been forked yet, it must be built in
            if (!this.has(genID.package)) {
                return false;
            }

            // let's try to find the generator in the app state.
            var localGen = _.find(this.get(genID.package).getGensByModule(genID.module), function(gen) { return gen.name === genID.name; });

            // expect it to not be found if it's builtin.
            return localGen === undefined;
        },

        isGeneratorEditable: function(generatorPath) {
            return !this.isGeneratorBuiltin(generatorPath);
        },

        isNameUnique: function(newPackageModuleName) {
            // TODO FIXME
            // 1. this doesn't include builtins
            // 2. shouldn't you do a has check before doing get?

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
                json[key] = val.serialize();
            });

            return json;
        }

    });

    return PluginsModel;
});
