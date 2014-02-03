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
            var plugins = v1State.get('generators').toJSON();
            this.$el.html(_.template(util.getHTML('plugins-page'), {plugins: plugins}));
            return this;
        },
        clickedPluginToggle: function(e){
            $($(e.target).closest("input")).toggleClass('checked');
        },

        browsePluginList: function (generatorList){
            
        }
    });

    return PluginsManagerView;

});
