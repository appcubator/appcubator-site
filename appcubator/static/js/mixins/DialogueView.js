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
      'click .btn.ok' : 'okCase',
      'click .btn.cancel' : 'cancelCase'
    },

    initialize: function(data, successCallback) {
      _.bindAll(this);
      this.successCallback = successCallback;
      this.render(data.text);
    },

    render : function(text) {
      if(text) {
        this.el.innerHTML += '<p style="padding:30px;">'+text+'</p>';
      }

      this.el.innerHTML += '<div class="bottom-sect"><div class="btn cancel">Cancel</div><div class="btn ok offset1">Ok</div></div>';

      return this;
    },

    okCase: function() {
      this.successCallback.call(this);
      this.closeModal();
    },

    cancelCase: function() {
      this.closeModal();
    }

  });

  return SimpleDialogueView;
});
