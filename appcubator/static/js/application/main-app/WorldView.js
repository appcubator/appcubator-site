define([
  'mixins/SimpleModalView',
  'app/ShareModalView',
  'app/entities/AdminPanelView',
  'app/templates/MainTemplates',
  'util'
],
function(SimpleModalView, ShareModalView, AdminPanelView) {

  var WorldView = Backbone.View.extend({
    el : document.getElementById('world-div'),
    id : 'world-div',
    css: 'app-page',
    className: 'welcome garage',
    expanded: false,

    events : {
      'click .hide-overlay' : 'hide',
      'click .see-all'      : 'showAll',
      'click .hide-all'     : 'hideAll'
    },

    initialize: function() {
      _.bindAll(this);
      this.render();
    },

    render: function() {
        var self = this;
        $(window).on('keydown', function(e) {
            if(e.keyCode == 27) { self.hide(); }
        });

        $('.toggle-invitations-modal').on('click', function(e) {
            require(['app/InvitationsView'], function(InvitationsView) {
                self.hide();
                new InvitationsView();
            });
            e.preventDefault();
        });
    },

    bindOutsideClick: function(e) {
        if (!util.isMouseOn(e.pageX, e.pageY, this.el, 30)) {
            this.hide();
        }
    },

    hide: function() {
      this.$el.hide();
      $('.world-toggle').removeClass('active');
      this.expanded = false;

      $(document).off('mousedown', this.bindOutsideClick);
    },

    show: function() {
      this.$el.show();
      $('.world-toggle').addClass('active');
      this.expanded = true;

      $(document).on('mousedown', this.bindOutsideClick);
    },

    toggle: function() {
      if(this.expanded) {
        this.hide();
      }
      else {
        this.show();
      }
    },

    setEnvironmentEditor: function() {
      this.el.className += ' editor';
    },

    unsetEnvironmentEditor: function() {
      this.el.className.replace('editor', '');
    },

    showAll: function() {
      $('.three-apps').hide();
      $('.current-app-info').hide();
      $('.see-all').hide();
      $('.all-apps').fadeIn();
      $('.hide-all').fadeIn();
      $('.all-app.title').fadeIn();
    },

    hideAll: function() {
      $('.three-apps').fadeIn();
      $('.current-app-info').fadeIn();
      $('.see-all').fadeIn();
      $('.all-apps').hide();
      $('.hide-all').hide();
      $('.all-app.title').hide();
    }

  });

  return WorldView;
});
