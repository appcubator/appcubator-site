define(function(require, exports, module) {

    'use strict';

    require('util');
    require('mixins/BackboneDropdownView');

    var AccountDropdownView = Backbone.DropdownView.extend({
        events: {

        },
        subviews: [],

        initialize: function() {

        },

        render: function() {
            return this;
        }
    });

    return AccountDropdownView;

});
