define(function(require, exports, module) {

    'use strict';

    var SoftErrorView = require('app/SoftErrorView');
    var DialogueView = require('mixins/DialogueView');
    require('app/templates/TableTemplates');
    require('prettyCheckable');


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
            this.el.innerHTML = 'No data available';
            return this;
        },

    
    });

    return TableDataView;
});