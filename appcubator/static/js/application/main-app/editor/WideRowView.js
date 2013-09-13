define([
  'util'
],
function() {

  var WideRowView = Backbone.View.extend({
    className : 'row wide',
    style: 'min-height:30px',
    _container : null,

    events: {

    },
    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      var container = document.createElement('div');
      container.className = "container";
      this.container = container;

      this.el.appendChild(container);

      return this;
    }

  });

  return WideRowView;
});
