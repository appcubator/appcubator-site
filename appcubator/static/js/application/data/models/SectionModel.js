define(function(require, exports, module) {

    'use strict';

    require('backbone');
    require('mixins/BackboneConvenience');

    var WidgetCollection = require('collections/WidgetCollection');
    var ColumnModel = require('models/ColumnModel');

    var SectionModel = Backbone.Model.extend({
        initialize: function(bone) {
            var columnCollection = Backbone.Collection.extend({ model: ColumnModel });
            var columnsColl = new columnCollection();
            columnsColl.add(bone.columns || []);
            this.set("columns", columnsColl);
        },

        getWidgetsCollection: function () {
            if(this.widgetsCollection) return this.widgetsCollection;

            this.widgetsCollection = new WidgetCollection();
            
            this.get('columns').each(function(columnModel) {
                this.widgetsCollection.add(columnModel.get('uielements').models);
                this.bindColumn(columnModel);
            }, this);
            
            this.get('columns').on('add', this.bindColumn);

            return this.widgetsCollection;
        },

        bindColumn: function (columnModel) {

            columnModel.get('uielements').on('remove', function(widgetModel) {
                this.widgetsCollection.remove(widgetModel, columnModel);
            }, this);

            columnModel.get('uielements').on('add', function(widgetModel) {
                this.widgetsCollection.add(widgetModel, columnModel);
            }, this);

        },

        toJSON: function(options) {
            var options = options || {};
            var json = _.clone(this.attributes);
            json.columns = json.columns.serialize(options);
            return json;
        }
    });

    return SectionModel;
});