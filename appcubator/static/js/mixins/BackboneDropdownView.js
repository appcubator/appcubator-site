define([
        'backbone',
        'jquery-ui'
    ],

    function() {

        Backbone.DropdownView = Backbone.View.extend({

            toggleElement: null,
            events: {

            },
            _configure: function(options) {
                Backbone.DropdownView.__super__._configure.call(this, options);
                _.bindAll(this);
            },

            _ensureElement: function(options) {
                Backbone.DropdownView.__super__._ensureElement.call(this, options);
            },

            setToggleEl: function($el) {
                this.$toggleEl = $el;
                var self = this;
                $el.on('click', function() {
                    self.toggle();
                });
            },
            // Set the displacement of the little pointer
            setPointerPosition: function(offset){

            },

            toggle: function() {
                if(this.isExpanded) { this.hide(); } else { this.expand(); }
            },

            expand: function() {
                this.$el.addClass('expanded');
                this.$toggleEl.addClass('expanded');
                this.isExpanded = true;
                $(window).on('mouseup', this.clickedOnElement);
                $( $('#inviteFrame').contents().get(0) ).on('mouseup', this.clickedOnElement);
                $(window).on('keydown', this.closeHandler);

            },

            hide: function() {
                this.$el.removeClass('expanded');
                this.$toggleEl.removeClass('expanded');

                this.isExpanded = false;
                $(window).off('mouseup', this.clickedOnElement);
                $( $('#inviteFrame').contents().get(0) ).off('mouseup', this.clickedOnElement);
                $(window).off('keydown', this.closeHandler);
            },

            clickedOnElement: function(e) {
                var container = this.$el;
                var toggleEl = this.$toggleEl;
                // if the target of the click isn't the container
                // ... nor a descendant of the container
                if (!container.is(e.target) && !toggleEl.is(e.target) &&
                    container.has(e.target).length === 0 && toggleEl.has(e.target).length === 0)
                {
                    this.hide();
                }
            },

            closeHandler: function(e) {
                if(e.keyCode == 27) {
                    this.hide();
                }
            }

        });

        return Backbone;
    });
