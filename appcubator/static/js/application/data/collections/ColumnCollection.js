define([
  'models/ColumnModel'
],
function() {

  var ColumnCollection = Backbone.Collection.extend({
    model : ColumnModel
  });

  return ColumnCollection;
});
