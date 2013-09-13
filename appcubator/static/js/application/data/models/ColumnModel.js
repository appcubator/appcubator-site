define(['backbone'],

function() {

    var ColumnModel = Backbone.Model.extend({
        initialize: function(bone) {
            this.rows = new ColumnCollection([]);
        }
    });

    return ColumnModel;
});