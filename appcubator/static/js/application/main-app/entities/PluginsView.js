define(function(require, exports, module) {

    'use strict';

    var UserTableModel = require('models/UserTableModel');
    var TableModel = require('models/TableModel');
    var TableView = require('entities/TableView');
    var plugins = {
        repoAddress: undefined // Define this later to access repo. Import from global settings/env
    }

    require('util');
    require('mixins/BackboneDropdownView');

    var PluginsView = Backbone.DropdownView.extend({
        title: 'Tables',
        className: 'plugins-view',
        events: {
            'click .plugin-toggle': 'clickedTableName'
        },
        subviews: [],
        initialize: function() {
           
        },

        render: function() {
            // get this from somewhere else later.
            var pluginsTmp = {
                plugins: [
                    { 
                        name: "BuyAndSell", 
                        description: "Add the ability to transact between models. Lorem ipsum dolor sit amet, consectetur. ", 
                        address: "#"
                    },
                    { 
                        name: "CRUD", 
                        description: "Create Read Update Destroy", 
                        address: "#"
                    },
                    { 
                        name: "Apify", 
                        description: "Create an API to retive your models", 
                        address: "#"
                    },
                    { 
                        name: "BuyAndSell", 
                        description: "Add the ability to transact between models. Lorem ipsum dolor sit amet, consectetur. ", 
                        address: "#"
                    },
                    { 
                        name: "CRUD", 
                        description: "Create Read Update Destroy", 
                        address: "#"
                    },
                    { 
                        name: "Apify", 
                        description: "Create an API to retive your models", 
                        address: "#"
                    }                                                     
                ]
            }
            this.$el.html(_.template(util.getHTML('plugins-page'), pluginsTmp));
            return this;
        },

       
    });

    return PluginsView;

});
