define([
  'models/WideRowModel'
],
function(WideRowModel) {

  var WideRowCollection = Backbone.Collection.extend({
    model : WideRowModel
  });

  return WideRowCollection;
});
