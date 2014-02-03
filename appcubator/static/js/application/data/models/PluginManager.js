define([

    ], function(require, exports, module) {
    'use strict';

    require('backbone');


    var PluginManager = Backbone.Model.extend({
        initialize: function(options) {
            _.bindAll(this);
            this.pages = options.pages;
            this.collection = options.collection    
        },
        defaults: {
            plugins: [],
            getPlugins: function(){
                var pluginAddress = "http://localhost:3001/packageList"
                $.ajax({
                    url:
                    success: function(genList){

                    }
                })
            },
        },
         d
    });

    return PluginManager;
});
