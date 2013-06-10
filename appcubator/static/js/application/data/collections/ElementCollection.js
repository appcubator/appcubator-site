define([
  'models/UIElementModel'
],
function(UIElementModel) {

  var ElementCollection = Backbone.Collection.extend({
    model : UIElementModel
  });

  return ElementCollection;
});

