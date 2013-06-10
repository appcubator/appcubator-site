define([
  'models/ActionModel'
],
function(ActionModel) {

  var ActionCollection = Backbone.Collection.extend({
    model: ActionModel,

    removePageRedirect: function() {
      var self = this;
      this.each(function(model) {
        if(model.get('type') == "redirect") { self.remove(model); }
      });
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
