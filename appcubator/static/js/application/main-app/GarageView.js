define([
  'mixins/SimpleModalView',
  'app/ShareModalView',
  'app/entities/AdminPanelView',
  'app/templates/MainTemplates',
  'util'
],
function(SimpleModalView, ShareModalView, AdminPanelView) {

  var GarageView = Backbone.View.extend({
    css: 'app-page',
    className: 'fixed-bg welcome garage',

    events : {
      'click .hide-overlay' : 'hide'
      // 'click .tutorial'        : 'showTutorial',
      // 'click .feedback'        : 'showFeedback',
      // 'click #deploy'          : 'deploy',
      // 'click .browse'          : 'browse',
      // 'click #share'           : 'share',
      // 'click .edit-btn'        : 'settings'
    },

    initialize: function() {
      _.bindAll(this);
      this.subviews = [this.analyticsView];
      this.render();
      console.trace();
    },

    render: function() {
      var page_context = {};
      this.el.innerHTML = _.template(util.getHTML('garage-temp'), page_context);
      document.body.appendChild(this.el);
    },

    hide: function() {
      this.$el.hide();
    },

    show: function() {
      this.$el.show();
    }

  });

  return GarageView;
});
