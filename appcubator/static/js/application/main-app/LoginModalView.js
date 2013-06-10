define([
  'mixins/BackboneModal'
],
function() {

  var LoginModalView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'login-modal',
    padding: 40,

    initialize: function(text) {
      this.render();
      $('.username').focus();
    },

    render : function() {
      this.el.innerHTML = iui.get('login-form-template').innerHTML;
      return this;
    }
  });

  return LoginModalView;
});