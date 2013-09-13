define(['collections/ColumnCollection'],

function(ColumnCollection) {

    var WideRowModel = Backbone.Model.extend({
        
        initialize: function(bone) {
            _.bindAll(this);
            bone = bone || {};
            this.set('columns', new ColumnCollection(bone.columns||[]));
        },

        getColumns: function() {
          return this.get('columns');
        }

    });

    return WideRowModel;
});