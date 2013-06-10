define([
  'models/FieldModel'
],
function(FieldModel) {

  var FieldsCollection = Backbone.Collection.extend({
    model : FieldModel
  });

  return FieldsCollection;
});