define(function(require, exports, module) {

    'use strict';
    require('backbone');
    require('util');
    require('mixins/BackboneDropdownView');

    var SettingsView = Backbone.DropdownView.extend({
        title: 'Plugins',
        className: 'settings-view',
        subviews: [],

        events: {

        },

        initialize: function() {
            _.bindAll(this);
        },

        render: function() {
            // this.el.innerHTML = 'Hey';
            return this;
        }

    });

    return SettingsView;
});