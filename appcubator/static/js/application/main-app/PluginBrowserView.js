define([
        'mixins/BackboneModal',
        'util'
    ],
    function() {

        var PluginBrowserView = Backbone.ModalView.extend({
            className: "plugin-browser-panel",
            width: 800,
            height: 630,
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

            layoutPlugins: function (listPlugins) {
                this.currentList = listPlugins;
                var template = util.getHTML('plugin-browser');
                this.el.innerHTML = _.template(template, {pluginsList: listPlugins});
            },

            addPlugin: function(e) {
                var ind = e.currentTarget.id.replace('add-','');
                var plugin = this.currentList[ind];
                console.log(plugin);
            }

        });

        return PluginBrowserView;
    });