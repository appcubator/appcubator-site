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

    _countdownToRefresh : function() {
        /* This only works for the DeployView, because there is a span w ID = countdown-ksikka. */
        var cntEl = document.getElementById("countdown-ksikka");
        function countdown() {
          var n = parseInt(cntEl.innerHTML);
          if (n == 0) {
            window.location.reload(true);
          } else {
            cntEl.innerHTML = n-1;
            window.setTimeout(countdown, 1000);
          }
        }
        window.setTimeout(countdown, 1000);
    },

    render : function(img, text) {
      if(img) { this.el.innerHTML += '<img src="/static/img/'+img+'">'; }
      if(text) { this.el.innerHTML += '<p>'+text+'</p>'; }

      return this;
    }
  });

  return ErrorDialogueView;
});
