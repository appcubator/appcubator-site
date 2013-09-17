define([
    'collections/WidgetCollection'],

    function(WidgetCollection) {

        var ColumnModel = Backbone.Model.extend({
            initialize: function(bone) {
                //this.rows = new ColumnCollection([]);
                this.set('width', bone.width||1);
                this.set('elements', new WidgetCollection(bone.elements||[]));
            },

            splitHorizontally: function() {

                var width = this.getWidth();
                if(width == 1) return;

                width = Math.floor(width/2);
                this.set('width', width);

                var json = {};
                json.width = width;
                this.collection.push(json);
            },

            getElements: function() {
                return this.get('elements');
            },

            addElement: function(widgetM) {
                widgetM.removeFromCurrentColumn();
                this.get('elements').push(widgetM);
            },

            getWidth: function() {
                return this.get('width');
            }
        });

        return ColumnModel;
    });