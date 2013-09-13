define(['backbone'],

    function() {

        var ColumnModel = Backbone.Model.extend({
            initialize: function(bone) {
                //this.rows = new ColumnCollection([]);
                this.set('width', bone.width||1);
            },

            split: function() {
                var json = {};
            },

            getWidth: function() {
                return this.get('width');
            }
        });

        return ColumnModel;
    });