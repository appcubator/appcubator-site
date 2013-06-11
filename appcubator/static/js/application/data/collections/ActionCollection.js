define([
  'models/ActionModel'
],
function(ActionModel) {

  var ActionCollection = Backbone.Collection.extend({
    model: ActionModel,

    removePageRedirect: function() {
      this.each(function(model) {
        if(model.get('type') == "redirect") { this.remove(model); }
      }, this);
    },

    addRedirect: function(pageModel) {
      this.push({
        type : "redirect",
        pageName : pageModel.get('name')
      });
    }
  });

  return ActionCollection;
});
