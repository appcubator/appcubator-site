define([
  'models/WidgetContainerModel',
  'backbone'
],
function(WidgetContainerModel,
         Backbone) {

  var ContainersCollection = Backbone.Collection.extend({

    model : WidgetContainerModel,
    selectedEl: null,

    initialize: function() {

    },

    unselectAll: function() {
      this.each(function(model) { model.set('selected', false); });
      this.selectedEl = null;
    },

    select : function(model) {
      this.unselectAll();
      this.selectedEl = model;
      this.trigger('selected');
    },

    removeSelected  : function(e) {
      if(this.editMode !== true) {
        this.remove(this.selectedEl);
        this.selectedEl = null;
        e.preventDefault();
      }
    }
  });

  return ContainersCollection;
});
