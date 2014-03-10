define(function(require, exports, module) {

    'use strict';
    require('util');
    require('mixins/BackboneDropdownView');
    var PluginBrowserView = require('app/plugins_view/PluginBrowserView');

    var PluginsView = Backbone.DropdownView.extend({

        title: 'Plugins',

        className: 'dropdown-view plugins-view',

        events: {
            // 'click .onoffswitch': 'clickedPluginToggle',
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

        clickedPluginToggle: function(e){

            var input = $(e.target).closest("[type='checkbox']");
            var pluginName = $(input).attr('pluginName');
            var pluginEnabled = $(input).hasClass('checked');

            if (pluginEnabled){
                $(input).removeClass('checked');
            } else {
                $(input).addClass('checked');
            }

            var plugin = v1.currentApp.model.get('plugins').find(
                function (p) {
                    if (p.get('metadata').name === pluginName){
                        if (pluginEnabled){
                            p.disablePlugin();
                        } else {
                            p.enablePlugin();
                        }
                    }
                    return (p.get('metadata').name === pluginName);
            });

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
