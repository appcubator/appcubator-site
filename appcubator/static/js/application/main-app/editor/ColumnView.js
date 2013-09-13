define([
  'util'
],
function() {

  var ColumnView = Backbone.View.extend({
    className : 'column-view',
    width: 12,
    events: {

    },
    initialize: function() {
      _.bindAll(this);
    },

  });

  return ColumnView;
});
