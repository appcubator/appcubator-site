define(function(require, exports, module) {

    'use strict';
    require('util');
    require('mixins/BackboneDropdownView');
    var PluginBrowserView = require('PluginBrowserView');

    var PluginsManagerView = Backbone.DropdownView.extend({
        title: 'Plugins',
        className: 'plugins-view',
        events: {
            'click .onoffswitch': 'clickedPluginToggle',
            'click .browsePluginsButton': 'browsePlugins'
        },
        subviews: [],
        initialize: function() {
        },
        render: function() {
            var plugins = v1State.get('plugins').toJSON();
            this.$el.html(_.template(util.getHTML('plugins-page'), {plugins: plugins}));
            return this;
        },
        browsePlugins: function(){
            var browserView = new PluginBrowserView({
                repoAddress: "http://localhost:3001/packageListing"
            });
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
                    if (p.get('pluginInformation').name === pluginName){
                        if (pluginEnabled){
                            p.disablePlugin();
                        } else {
                            p.enablePlugin();
                        }
                    }
                    return (p.get('pluginInformation').name === pluginName); 
            });
            console.log(this.getActivePlugins())
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

    return PluginsManagerView;

});
