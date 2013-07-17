define([
  'backbone',
  'jquery-ui'
],

function(Backbone) {

  Backbone.ModalView = Backbone.View.extend({
    width: 500,
    padding: 30,
    events : {
      'click .modal-bg' : 'closeModal',
      'keydown'         : 'handleKey',
      'click .done-btn' : 'closeModal'
    },

    _configure: function(options) {
      Backbone.ModalView.__super__._configure.call(this, options);
      if(options.height) {
        this.height = options.height;
      }
      this.backgroundDiv = this.setupModal();
      this.modalWindow = this.setupModalWindow();
      _.bindAll(this);
    },

    _ensureElement: function(options) {
      Backbone.ModalView.__super__._ensureElement.call(this, options);
    },

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
      div.className = 'modal ' + this.className;
      div.style.width = this.width + 'px';
      if(this.height) {
        div.style.height = this.height + 'px';
      }
      else {
        div.style.minHeight = '300px';
      }
      div.style.top = '50%';
      div.style.left = '50%';
      div.style.marginLeft= '-'+ (this.width/2) +'px';
      div.style.marginTop = '-300px';

      div.style.padding = this.padding + 'px';
      div.style.zIndex = 3001;

      if(this.title) {
        var title = document.createElement('h3');
        title.innerText = this.title;
        div.appendChild(title);
      }
      if(this.doneButton) {
        $(div).append('<div class="bottom-sect"><div class="q-mark"></div><div class="btn done-btn">Done</div></div>');
        $(div).find('.done-btn').on('click', function() {
          self.closeModal();
        });
      }

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

      this.close();
    },

    handleKey: function(e) {
      if(e.keyCode == 27) { //escape
        this.closeModal();
        e.stopPropagation();
      }
    }

  });

  return Backbone;
});
