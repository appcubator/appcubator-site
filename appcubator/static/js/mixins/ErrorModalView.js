define([
  'backbone',
  'mixins/BackboneModal',
  'util'
],
function(Backbone) {

  var ErrorModalView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'deployed',

    initialize: function(data, callback) {
      this.render(data.img, data.text);
      this.callback = callback;
    },

    render : function(img, text) {
      if(img) {
        this.el.innerHTML += '<img src="/static/img/'+img+'">';
      }

      if(text) {
        text = text.replace('\n', '<br />');
        text = text.replace(' ', '&nbsp;');
        this.el.innerHTML += '<h3>'+text+'</h3>';
      }
      return this;
    }
  });

  return ErrorModalView;
});
