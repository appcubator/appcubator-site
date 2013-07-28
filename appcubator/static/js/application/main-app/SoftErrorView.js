define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  var SoftErrorView = Backbone.View.extend({
    className: 'soft-error-modal',
    events : {
    },

    initialize: function(options) {
      _.bindAll(this);

      this.text = options.text;
      this.path = options.path;
      this.render();
    },

    render: function() {

      var speech = document.createElement('span');
      speech.innerHTML = this.text;
      this.el.appendChild(speech);
      document.body.appendChild(this.el);
      console.log(this.el);
      return this;
    }

  });

  return SoftErrorView;
});
