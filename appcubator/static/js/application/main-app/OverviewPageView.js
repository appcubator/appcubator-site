define([
  'app/AnalyticsView',
  'mixins/SimpleModalView',
  'app/ShareModalView',
  'app/entities/AdminPanelView',
  'app/templates/MainTemplates',
  'util'
],
function(AnalyticsView, SimpleModalView, ShareModalView, AdminPanelView) {

  var OverviewPageView = Backbone.View.extend({
    css: 'app-page',

    events : {
      'click .tutorial'        : 'showTutorial',
      'click .feedback'        : 'showFeedback',
      'click #deploy'          : 'deploy',
      'click .browse'          : 'browse',
      'click #share'           : 'share',
      'click .edit-btn'        : 'settings'
    },

    initialize: function() {
      _.bindAll(this);
      this.analyticsView = new AnalyticsView();
      this.subviews = [this.analyticsView];

      this.title = "The Garage";
    },

    render: function() {
      var page_context = {};
      this.el.innerHTML = _.template(util.getHTML('app-main-page'), page_context);
      this.$('.analytics').append(this.analyticsView.render().el);
      this.renderNextStep();
    },

    renderNextStep: function() {
      var nmrPages = v1State.get('pages').length;
      var pagesStr = nmrPages > 1 ? ' pages' : ' page';
      if(nmrPages >= 4) {
        $('.what-to-do').html('You currently have '+ nmrPages + pagesStr + '.<br><a href="pages/">Add more on the Pages page</a>.');
      }
      else {
        $('.what-to-do').html('You can go to the <a href="tables/">Tables</a> page, and click "Access Data" to browse the data in your app\'s database.');
      }
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

  return OverviewPageView;
});
