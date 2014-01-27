define([
    'models/FormFieldModel',
    'mixins/BackboneConvenience'
  ],
  function(FormFieldModel) {

    var FormFieldCollection = Backbone.Collection.extend({
      model: FormFieldModel
    });

    return FormFieldCollection;
  });