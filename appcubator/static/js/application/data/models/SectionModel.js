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

        addElement: function(colId, type, extraData) {
            var layout = { col: colId };
            this.get('uielements').createElement(layout, className, id);
        },

        addElementWithPath: function (colId, type, generatorPath, extraData) {
            var layout = { col: colId };
            this.get('uielements').createElementWithGenPath(layout, generatorPath, type, extraData);
        },

        toJSON: function(options) {
            var options = options || {};
            var json = _.clone(this.attributes);
            json.columns = json.columns.serialize(options);
            
            console.log("section");
            console.log(options);
            if(options.generate) {
                json.cid = this.cid;
            }
            return json;
        }
    });

    return SectionModel;
});