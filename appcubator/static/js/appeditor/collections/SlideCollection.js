define([
  'models/SlideModel'
],
function(SlideModel) {

  var SlideCollection = Backbone.Collection.extend({
    model : SlideModel
  });

  return SlideCollection;
});
