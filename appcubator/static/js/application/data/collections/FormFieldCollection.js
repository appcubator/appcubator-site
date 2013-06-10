define([
  'models/FormFieldModel'
],
function(FormFieldModel) {

  var FormFieldCollection = Backbone.Collection.extend({
    model: FormFieldModel
  });

  return FormFieldCollection;
});
