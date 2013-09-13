define(['collections/ColumnCollection'],

function(ColumnCollection) {

    var WideRowModel = Backbone.Model.extend({
        initialize: function(bone) {
            this.colums = new ColumnCollection(bone.colums||[]);
        }
    });

    return WideRowModel;
});