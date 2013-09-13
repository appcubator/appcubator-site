define([
        'util'
    ],
    function() {

        var WideRowView = Backbone.View.extend({
            className: 'row wide',
            style: 'min-height:30px',
            _container: null,
            vGrid: 15,

            events: {

            },
            initialize: function(rowM) {
                _.bindAll(this);
                this.model = rowM;
                this.columns = new rowM.getColumns();
                this.subviews = [];
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
                    this.el.appendChild(columnView.render().el);
                    this.subviews.push(ColumnView);
                }, this);
            }

        });

        return WideRowView;
    });