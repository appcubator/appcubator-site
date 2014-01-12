define([
  'models/TemplateModel'
],
function(TemplateModel) {

  var TemplateCollection = Backbone.Collection.extend({
    model : TemplateModel
  });

  return TemplateCollection;
});