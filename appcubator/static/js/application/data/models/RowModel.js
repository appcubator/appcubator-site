define([
  'models/LayoutModel'
], function(LayoutModel) {

  var RowModel = Backbone.Model.extend({

    initialize: function(bone) {
      this.set('isListOrGrid', "list");
      this.set('layout', new LayoutModel((bone.layout||{height:10, width: 4})));

      var WidgetCollection = require('collections/WidgetCollection');
      this.set('uielements', new WidgetCollection());
      this.set('goesTo', bone.goesTo||null);

      var WidgetModel = require('models/WidgetModel');
      _.each(bone.uielements, function(element) {
        var widget = new WidgetModel(element);
        this.get('uielements').add(widget);
      }, this);
    },

    toJSON: function() {
      var json  = _.clone(this.attributes);
      json.uielements = json.uielements.toJSON();

      return json;
    }

  });

  return RowModel;
});