define([
  'models/FormModel'
],
function(FormModel) {

  var FormCollection = Backbone.Collection.extend({
    model : FormModel
  });

  return FormCollection;
});