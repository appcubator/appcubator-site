define([
  'app/AnalyticsView',
  'mixins/SimpleModalView',
  'app/templates/MainTemplates'
],
function(AnalyticsView, SimpleModalView) {

  var OverviewPageView = Backbone.View.extend({
    css: 'app-page',

    events : {
      'click .tutorial'        : 'showTutorial',
      'click .feedback'        : 'showFeedback',
      'click #deploy'          : 'deploy'
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
      $('.what-to-do').html('You currently have '+ nmrPages + pagesStr + '.<br><a href="pages/">Add more on the Pages page</a>.');
    },

    deploy: function() {
      $('#deploy').find('h4').html('Deploying...');
      v1.deploy(function() {
        $('#deploy').find('h4').html('Go To App');
      });
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
