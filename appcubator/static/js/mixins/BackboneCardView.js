define([
        'backbone',
        'jquery-ui'
    ],

    function() {

        Backbone.CardView = Backbone.View.extend({
            width: 800,
            padding: 0,

            bodyEl: null,

            events: {
                'click .modal-bg': 'closeModal',
                'keydown': 'handleKey',
                'click .done': 'closeModal'
            },

            _configure: function(options) {
                Backbone.ModalView.__super__._configure.call(this, options);
                if (options.height) {
                    this.height = options.height;
                }
                this.bodyEl = document.body;
                this.backgroundDiv = this.setupModal();
                this.modalWindow = this.setupModalWindow();
                _.bindAll(this);
            },

            _ensureElement: function(options) {
                Backbone.ModalView.__super__._ensureElement.call(this, options);
            },

            setBodyEl: function(el) {
                this.bodyEl = el;
            },

            setupModal: function() {
                var self = this;
                var div = document.createElement('div');
                div.className = "modal-bg";
                div.style.position = 'fixed';
                div.style.width = '100%';
                div.style.height = '100%';
                div.style.top = '0';
                div.style.left = '0';
                div.style.backgroundColor = '#222';
                div.style.opacity = '0.7';
                div.style.zIndex = 3000;
                this.bodyEl.appendChild(div);

                var closeHandler = function(e) {
                    if (e.keyCode == 27) {
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
                div.className = 'card-view bounceInUp ' + this.className;
                div.style.width = this.width + 'px';
                if (this.height) {
                    div.style.height = this.height + 'px';
                } else {
                    div.style.minHeight = '300px';
                    div.style.maxHeight = '630px';
                }
                div.style.top = '50%';
                div.style.left = '50%';
                div.style.marginLeft = '-' + (this.width / 2) + 'px';
                div.style.marginTop = '-300px';
                div.style.zIndex = 3001;
                div.style.padding = 0;

                if (this.title) {
                    var title = document.createElement('h3');
                    title.innerText = this.title;
                    div.appendChild(title);
                }
                if (this.doneButton) {
                    var qMark = '';
                    if (this.address) {
                        qMark = '<div class="q-mark"></div>';
                    }
                    $(div).append('<div class="bottom-sect">' + qMark + '<div class="btn done">Done</div></div>');
                    $(div).find('.done').on('click', function() {
                        self.closeModal();
                    });
                }

                var span = document.createElement('span');
                span.className = 'modal-down';
                span.style.position = 'absolute';
                span.style.right = '18px';
                span.style.top = '20px';
                span.innerText = '✔';
                span.style.zIndex = '1000';
                div.appendChild(span);

                var content = document.createElement('div');
                content.style.width = '100%';
                if (!this.title) content.style.height = (this.contentHeight || '100%');
                content.style.position = "relative";
                content.style.padding = (this.padding || 0) + 'px';
                div.appendChild(content);

                this.bodyEl.appendChild(div);

                $(span).on('click', function() {
                    self.closeModal();
                });

                this.el = content;
                return div;
            },

            closeModal: function(closeHandlerFn) {
                var self = this;
                this.undelegateEvents();
                if (this.callback) this.callback();
                if (this.onClose) this.onClose();
                
                $(self.modalWindow).addClass('animated');
                $(self.modalWindow).removeClass('bounceInUp');
                $(self.modalWindow).addClass('bounceOutDown');
                
                $(self.backgroundDiv).fadeOut();

                setTimeout(function() {
                    self.$el.remove();
                    self.remove();
                    $(self.modalWindow).remove();
                    $(self.backgroundDiv).remove();
                }, 550);

                if (closeHandlerFn) {
                    $(window).unbind('keydown', closeHandlerFn);
                }

                this.close();
            },

            handleKey: function(e) {
                if (e.keyCode == 27) { //escape
                    this.closeModal();
                    e.stopPropagation();
                }
            }

        });

        return Backbone;
    });