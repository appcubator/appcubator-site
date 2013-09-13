define(['backbone'],

function() {

    var WideRowModel = Backbone.Model.extend({
        initialize: function(bone) {
            this.colums = new ColumnCollection([]);
        }
    });

    return WideRowModel;
});