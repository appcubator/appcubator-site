define([
  'models/SectionModel'
],
function(SectionModel) {

  var SectionCollection = Backbone.Collection.extend({
    model : SectionModel
  });

  return SectionCollection;
});
