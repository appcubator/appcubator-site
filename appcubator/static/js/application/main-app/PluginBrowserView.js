define(function(require, exports, module) {

    'use strict';

    require('mixins/BackboneModal');
    require('util');

    var PluginModel = require('models/PluginModel');

    var PluginBrowserView = Backbone.ModalView.extend({
        className: "plugin-browser-panel",
        width: 800,
        height: 630,
        padding: 0,

        events: {
            'click .addPluginButton': 'addPlugin'
        },

        initialize: function(data) {
            _.bindAll(this);
            this.data = data;
            this.render();
        },

        currentList: null,

        render: function() {
            var self = this;
            var loadingSpin = util.addLoadingSpin(this.el);

            $.ajax({
                type: "GET",
                url: "/plugins/",
                dataType: "json",
                success: function(data) {
                    $(loadingSpin).remove();
                    self.layoutPlugins(data);
                }
            });

            return this;
        },

        layoutPlugins: function(listPlugins) {
            this.currentList = listPlugins;
            var template = util.getHTML('plugin-browser');
            this.el.innerHTML = _.template(template, {
                pluginsList: listPlugins
            });
        },

        addPlugin: function(e) {
            /* Installs the plugin */
            var ind = e.currentTarget.id.replace('add-', '');
            var plugin = this.currentList[ind];
            console.log(plugin);
            var pluginModel = new PluginModel(JSON.parse(plugin.data));
            pluginModel.set('pluginInformation', {
                description: plugin.description,
                name: plugin.name,
                origin: "appcubator"
            });
            pluginModel.enablePlugin();
            v1State.get('plugins').add(pluginModel);

            e.currentTarget.innerHTML = 'Plugin Installed ✔';
        }

    });

    return PluginBrowserView;
});