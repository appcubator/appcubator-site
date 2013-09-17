define(function(require, exports, module) {
    'use strict';

    require('util');
    var ColumnView = require('editor/ColumnView');

    var WideRowView = Backbone.View.extend({
        className: 'row wide',
        style: 'min-height:30px',
        _container: null,
        vGrid: 15,

        events: {

        },
        initialize: function(wRowM) {
            _.bindAll(this);
            this.model = wRowM;
            this.columns = wRowM.getColumns();
            this.subviews = [];

            this.listenTo(this.columns, 'add', this.appendColumn);
        },

        render: function() {
            var container = document.createElement('div');
            container.className = "container";
            this.container = container;
            this.el.appendChild(container);

            this.layoutColumns();

            return this;
        },

        layoutColumns: function() {
            this.columns.each(function(columnM) {
                var columnView = new ColumnView(columnM);
                this.container.appendChild(columnView.render().el);
                this.subviews.push(ColumnView);
            }, this);
        },

        appendColumn: function(columnM) {
            var columnView = new ColumnView(columnM);
            this.container.appendChild(columnView.render().el);
            this.subviews.push(ColumnView);
        }

    });

    return WideRowView;
});