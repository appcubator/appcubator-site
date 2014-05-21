define(function(require, exports, module) {

    'use strict';
    require('util');
    require('mixins/BackboneDropdownView');
    var PluginBrowserView = require('app/plugins_view/PluginBrowserView');

    var tempPluginsView = 
    [
    '<div class="hoff1">',
        '<h2 class="pheader">',
            'Installed Plugins',
        '</h2>',
        "<button id='browsePlugins' class='btn pull-right browsePluginsButton'>Browse All</button>",
        "<hr>",
        "<div class='pluginContainer'>",
        "<% for (var i=0; i<plugins.length;i++) { if (!plugins[i].metadata) {  plugins[i].metadata={}; plugins[i].metadata.name = plugins[i].name; plugins[i].metadata.description = ''; } %>",
        '<div class="pluginBar">',
            '<div class="identifier"><div class="pluginImageHolder"></div></div>',
            '<div class="meta-data">',
                '<a class="title" href="#""><%=plugins[i].metadata.name%></a>',
                '<div class="information"> <%=plugins[i].metadata.description%></div>',
            '</div>',
            '<div id="delete-plugin-<%= plugins[i].metadata.name %>" class="delete-plugin">X</div>',
        '</div>',
        '<hr>',
        '<% } %>',
        '</div>',
    '</div>'].join('\n');


    var PluginsView = Backbone.DropdownView.extend({

        title: 'Plugins',

        className: 'dropdown-view plugins-view',

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
            plugins = _.map(plugins, function(val, key) { val.name = key; return val; });
            this.$el.html(_.template(tempPluginsView, {plugins: plugins}));

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
