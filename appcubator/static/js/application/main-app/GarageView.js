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
    },

    render: function() {
      var page_context = {};
      this.el.innerHTML = _.template(util.getHTML('garage-temp'), page_context);
      document.body.appendChild(this.el);
    },

    deploy: function() {
      var threeDots = util.threeDots();
      $('#deploy').find('h4').html('Publishing').append(threeDots.el);

      v1.deploy(function() {
        $('#deploy').find('h4').html('Go To App');
        clearInterval(threeDots.timer);
      });
    },

    share: function() {
      new ShareModalView();
    },

    browse: function() {
      new AdminPanelView();
    },

    settings: function(e) {
      e.preventDefault();
      v1.navigate('/app/' + appId + '/info/', {trigger:true}); // can't go directly to domain settings section due to limitations of route function
    },

    showTutorial: function() {
      v1.showTutorial();
    },

    showFeedback: function(e) {
      v1.showTutorial([8]);
      e.preventDefault();
    }

  });

  return GarageView;
});
