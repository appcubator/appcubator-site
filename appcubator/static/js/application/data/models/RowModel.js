define([
  'models/LayoutModel',
  'collections/WidgetCollection',
  'backbone'
], function(LayoutModel, WidgetCollection, Backbone) {

  var RowModel = Backbone.Model.extend({

    initialize: function(bone) {
      this.set('isListOrGrid', "list");
      this.set('layout', new LayoutModel((bone.layout||{height:10, width: 4})));
      this.set('uielements', new WidgetCollection());
      this.set('goesTo', bone.goesTo||null);

      var WidgetModel = require('models/WidgetModel');
      _.each(bone.uielements, function(element) {
        var widget = new WidgetModel(element);
        this.get('uielements').add(widget);
      }, this);
    }

  });

  return RowModel;
});