define([
  'mixins/SimpleModalView',
  'app/ShareModalView',
  'app/entities/AdminPanelView',
  'app/templates/MainTemplates',
  'util'
],
function(SimpleModalView, ShareModalView, AdminPanelView) {

  var GarageView = Backbone.View.extend({
    el : document.getElementById('garage-div'),
    css: 'app-page',
    className: 'welcome garage',

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

        return this;
    },

    hide: function() {
      this.$el.hide();
    },

    show: function() {
      this.$el.show();
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

  return GarageView;
});
