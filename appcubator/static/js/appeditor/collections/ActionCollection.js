define([
  'models/ActionModel'
],
function(ActionModel) {

  var ActionCollection = Backbone.Collection.extend({
    model: ActionModel
  });

  return ActionCollection;
});
