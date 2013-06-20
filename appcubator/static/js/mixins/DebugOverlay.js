define([
  'backbone',
  'mixins/BackboneModal',
  'util'
],
function(Backbone) {

  var ErrorModalView = Backbone.ModalView.extend({
    tagName: 'div',
    className: 'deployed',

    setupModal: function() {
      var self = this;
      var div = document.createElement('div');
      div.className = "modal-bg fadeIn";
      div.style.position = 'fixed';
      div.style.width = '100%';
      div.style.height = '100%';
      div.style.top = '0';
      div.style.left = '0';
      div.style.backgroundColor = '#222';
      div.style.opacity = '0.6';
      div.style.zIndex = 3000;
      document.body.appendChild(div);

      var closeHandler = function(e) {
        if(e.keyCode == 27) {
          self.closeModal(closeHandler);
        }
      };

      $(div).on('click', function() {
        self.closeModal(closeHandler);
      });


      $(window).on('keydown', closeHandler);

      return div;
    },

    setupModalWindow: function() {
      var self = this;

      var div = document.createElement('div');
      div.style.position = 'fixed';
      div.className = this.className;
      div.style.width = "85%";
      div.style.color = "white";
      div.style.lineHeight = "2em";
      div.style.fontSize = "16px";
      if(this.height) div.style.height = this.height;
      div.style.top = '0';
      /*
      div.style.left = '50%';
      div.style.marginLeft= '-'+ (this.width/2) +'px';
      div.style.marginTop = '-300px';
      */
      div.style.padding = this.padding + 'px';
      div.style.zIndex = 3001;

      var span = document.createElement('span');
      span.className = 'modal-cross';
      span.style.position = 'absolute';
      span.style.right = '15px';
      span.style.top = '15px';
      span.innerText = '×';
      div.appendChild(span);

      var content = document.createElement('div');
      content.style.width = '100%';
      div.appendChild(content);

      document.body.appendChild(div);

      $(span).on('click', function(){
        self.closeModal();
      });

      this.el = content;
      return div;
    },

    closeModal: function(closeHandlerFn) {
      var self = this;
      this.undelegateEvents();
      if(this.callback) this.callback();
      if(this.onClose) this.onClose();
      // fadeOut(function() { $(this).remove(); });
      $(self.modalWindow).fadeOut(100);
      $(self.backgroundDiv).hide();

      setTimeout(function(){
        self.$el.remove();
        self.remove();
        $(self.modalWindow).remove();
        $(self.backgroundDiv).remove();
      }, 550);

      if(closeHandlerFn) {
        $(window).unbind('keydown', closeHandlerFn);
      }

      this.stopListening();
    },
    initialize: function(data) {
      this.render(data.img, data.text);
    },

    render : function(img, text) {
      if(img) {
        this.el.innerHTML += '<img src="/static/img/'+img+'">';
      }

      if(text) {
        text = text.replace(/\n/g, '</p><p>');
        text = text.replace(/ /g, '&nbsp;');
        this.el.innerHTML += '<p>'+text+'</p>';
      }
      return this;
    }
  });

  return ErrorModalView;
});
