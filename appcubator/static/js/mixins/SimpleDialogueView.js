define([
  'backbone',
  'mixins/BackboneDialogue',
  'util'
],
function(Backbone) {

  var SimpleDialogueView = Backbone.DialogueView.extend({
    tagName: 'div',
    className: 'normal-dialogue',
    padding: 0,
    events : {
      'click .btn.done' : 'closeModal'
    },

    initialize: function(data) {
      this.render(data.img, data.text);
    },

    render : function(img, text) {
      if(img) {
        this.el.innerHTML += '<img src="/static/img/'+img+'">';
      }

      if(text) {
        this.el.innerHTML += '<p>'+text+'</p>';
      }

      this.el.innerHTML += '<div class="bottom-sect"><div class="btn done">Done</div></div>';

      return this;
    }
  });

  return SimpleDialogueView;
});
