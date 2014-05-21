define(function(require, exports, module) {

    'use strict';

    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');

    var TableDataView = Backbone.View.extend({
        el: null,
        tagName: 'div',
        collection: null,
        parentName: "",
        className: 'data-view',
        subviews: [],

        events: {
        },


        initialize: function(tableModel) {
            _.bindAll(this);
            this.model = tableModel;
        },

        render: function() {
            this.el.innerHTML = 'Coming soon...';
            return this;
        },


    });

    return TableDataView;
});
