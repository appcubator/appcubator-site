define([
  'models/ColumnModel'
],
function(ColumnModel) {

  var ColumnCollection = Backbone.Collection.extend({
    model : ColumnModel
  });

  return ColumnCollection;
});
