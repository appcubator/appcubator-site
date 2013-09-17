define(['backbone'],

    function() {

        var ColumnModel = Backbone.Model.extend({
            initialize: function(bone) {
                //this.rows = new ColumnCollection([]);
                this.set('width', bone.width||1);
            },

            split: function() {

                var width = this.getWidth();
                if(width == 1) return;

                width = Math.floor(width/2);
                this.set('width', width);

                var json = {};
                json.width = width;
                this.collection.push(json);
            },

            getWidth: function() {
                return this.get('width');
            }
        });

        return ColumnModel;
    });