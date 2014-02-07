define(function(require, exports, module) {

    'use strict';

    var UserTableModel = require('models/UserTableModel');
    var TableModel = require('models/TableModel');
    var TableView = require('entities/TableView');


    require('util');
    require('mixins/BackboneDropdownView');

    var PluginsView = Backbone.DropdownView.extend({
        title: 'Tables',
        className: 'plugins-view',
        events: {
            'click .onoffswitch': 'clickedPluginToggle'
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
                    },
                    { 
                        name: "CRUD", 
                        description: "Small particles of poop. JK.", 
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
            //this.$el.html(_.template(util.getHTML('plugins-page'), pluginsTmp));
            return this;
        },
        clickedPluginToggle: function(e){
            $($(e.target).closest("input")).toggleClass('checked');
            console.log($($(e.target).closest("input")).hasClass('checked'));
        }

       
    });

    return PluginsView;

});
