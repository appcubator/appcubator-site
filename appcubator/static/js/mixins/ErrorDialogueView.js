define([
  'backbone',
  'mixins/BackboneDialogue',
  'util'
],
function(Backbone) {

  var ErrorDialogueView = Backbone.DialogueView.extend({
    tagName: 'div',
    className: 'error-dialogue',
    events : {
      'click .btn.done' : 'closeModal'
    },

    initialize: function(data, callback) {
      this.render(data.img, data.text);
      this.callback = callback;
    },

    render : function(img, text) {
      if(img) { this.el.innerHTML += '<img src="/static/img/'+img+'">'; }
      if(text) { this.el.innerHTML += '<p>'+text+'</p>'; }
      this.el.innerHTML += '<div class="bottom-sect"><div class="btn done">OK, Got it.</div></div>';

      return this;
    }
  });

  return ErrorDialogueView;
});
