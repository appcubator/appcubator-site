define([
  'mixins/BackbonePickOneView',
  'mixins/BackboneModal',
  'util'
],
function() {

  var WideRowView = Backbone.View.extend({
    className : 'navbar-editor-modal',
    width: 600,
    padding: 20,
    title: "New Create Form",

    events: {

    },
    initialize: function(layout, id) {
      _.bindAll(this);

    },

  });

  return PickCreateFormEntityView;
});
