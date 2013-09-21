define([
  'models/FieldModel'
],
function(FieldModel) {

  var FieldsCollection = Backbone.Collection.extend({
    model : FieldModel,
    uniqueKeys: ["name"],
    getImageFields: function() {
      return this.filter(function(fieldM) { return fieldM.get('type') == "image"; });
    }
  });

  return FieldsCollection;
});