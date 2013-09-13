define([
  'models/WideRowModel'
],
function(WideRowModel) {

  var WideRowCollection = Backbone.Collection.extend({
    model : WideRowModel,
    addNewRow: function() {
      this.add(new WideRowModel());
    }
  });

  return WideRowCollection;
});
