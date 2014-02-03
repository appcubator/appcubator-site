define(function(require, exports, module) {

    'use strict';
    require('util');
    require('mixins/BackboneDropdownView');

    var PluginsManagerView = Backbone.DropdownView.extend({
        title: 'Plugins',
        className: 'plugins-view',
        events: {
            'click .onoffswitch': 'clickedPluginToggle'
        },
        subviews: [],
        initialize: function() {
        },

        render: function() {
            var pluginsThing = {
                plugins: [
                    {
                        name: "Plugin 1",
                        description: "Lorem Ipsum"
                    }                
                ]
            };
            this.$el.html(_.template(util.getHTML('plugins-page'), pluginsThing));
            return this;
        },
        clickedPluginToggle: function(e){
            $($(e.target).closest("input")).toggleClass('checked');
            console.log($($(e.target).closest("input")).hasClass('checked'));
        },

        browsePluginList: function (generatorList){
            
        }
    });

    return PluginsManagerView;

});
