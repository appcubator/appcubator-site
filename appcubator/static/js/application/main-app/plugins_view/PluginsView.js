define(function(require, exports, module) {

    'use strict';
    require('util');
    require('mixins/BackboneDropdownView');
    var PluginBrowserView = require('app/plugins_view/PluginBrowserView');

    var PluginsView = Backbone.DropdownView.extend({

        title: 'Plugins',

        className: 'plugins-view',

        events: {
            'click .delete-plugin': 'deletePlugin',
            'click .browsePluginsButton': 'browsePlugins'
        },

        initialize: function() {
            _.bindAll(this);
            this.listenTo(v1State.get('plugins'), 'change', this.render);
        },

        render: function() {
            var plugins = v1State.get('plugins').serialize();
            plugins = _.map(plugins, function(val, key) { return val; });
            this.$el.html(_.template(util.getHTML('plugins-page'), {plugins: plugins}));

            return this;
        },

        browsePlugins: function(){
            var browserView = new PluginBrowserView({});
        },

        deletePlugin: function(e){

            var delButton = $(e.target);
            var elToRemove = delButton.parents('.pluginBar');
            var pluginName = delButton.attr('id').replace('delete-plugin-', '');

            v1.currentApp.model.get('plugins').uninstall(pluginName);
            
            elToRemove.remove();

        },

        getActivePlugins: function (){

            var enabledPlugins = v1.currentApp.model.get('plugins').filter(
                function (p) {
                    return p.getPluginStatus() ;
                }
            );

            return enabledPlugins;
        }
    });

    return PluginsView;

});
