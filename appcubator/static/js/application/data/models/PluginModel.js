define([
    'require',
    'backbone'
], function(require) {

    var Backbone = require('backbone');
    var GeneratorModel = Backbone.Model.extend({});
    var GeneratorCollection = Backbone.Collection.extend({
        model: GeneratorModel
    });

    var PluginModel = Backbone.Model.extend({
        defaults: {},

        initialize: function(options) {

        },

        fetchPlugin: function() {
            var name = this.get("name");
            var pluginAddress = "http://localhost:3001/package/" + name;
            $.ajax({
                url: pluginAddress,
                success: function(generators) {
                    console.log(generators);
                    //this.set('modules',  generators)
                }.bind(this)
            });
        },

        enablePlugin: function() {
            console.log("Enabling Plugin" + this.get('pluginInformation').name);
            var pluginInfo = this.get("pluginInformation");
            pluginInfo.enabled = true;
            this.set('pluginInformation', pluginInfo);
            /* Copies the generators to appState.generators */
            var generators = _.clone(this.toJSON());
            generators = _.omit(generators, 'pluginInformation');
            v1State.get('generators')[pluginInfo.name] = generators;
        },

        getActiveUIElements: function() {
            var uielements = _.map(this.get('uielements'), function(el) {
                el.generatorIdentifier = this.get('pluginInformation').name + ".uielements." + el.name;
                return el;
            }, this);
            return uielements;
        },

        isEnabled: function() {
            return (this.get('pluginInformation').enabled === true)?  true : false;
        },

        disablePlugin: function() {
            console.log("Disabling Plugin" + this.get('pluginInformation').name);
            var pluginInfo = this.get("pluginInformation");
            pluginInfo.enabled = false;
            this.set('pluginInformation', pluginInfo);
            /* Should remove the generators from appState.generators */

        },

        getPluginStatus: function() {
            return this.get('pluginInformation').enabled;
        }

    });

    return PluginModel;
});