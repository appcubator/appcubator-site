define([
  'backbone',
  'mixins/BackboneModal',
  'util'
],
function(Backbone) {

  var ErrorDialogueView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'error-dialogue',
    events : {
      'click .btn.done' : 'closeModal'
    },

    doneButton: true,

    initialize: function(data, callback) {
      this.render(data.img, data.text);
      this.callback = callback;
    },

    render : function(img, text) {
      console.log(text);
      if(img) { this.el.innerHTML += '<img src="/static/img/'+img+'">'; }
      if(text) { this.el.innerHTML += '<p>'+text+'</p>'; }

      return this;
    }
  });

  return ErrorDialogueView;
});
