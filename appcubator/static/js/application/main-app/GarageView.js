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
    className: 'fixed-bg welcome garage',

    events : {
      'click .hide-overlay' : 'hide',
      'click .see-all'      : 'showAll',
      'click .hide-all'     : 'hideAll'
      // 'click .tutorial'        : 'showTutorial',
      // 'click .feedback'        : 'showFeedback',
      // 'click #deploy'          : 'deploy',
      // 'click .browse'          : 'browse',
      // 'click #share'           : 'share',
      // 'click .edit-btn'        : 'settings'
    },

    initialize: function() {
      _.bindAll(this);
      this.render();
      console.trace();
    },

    render: function() {
      // var page_context = {};
      // this.el.style.display = 'none';
      // this.el.innerHTML = _.template(util.getHTML('garage-temp'), page_context);
      // document.body.appendChild(this.el);
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
