define([
  'models/UIElementModel'
],
function(UIElementModel) {

  var UIElementCollection = Backbone.Collection.extend({
    model : UIElementModel,

    initialize: function (models, type) {
      this.type = type;
    }
  });

  return UIElementCollection;
});
