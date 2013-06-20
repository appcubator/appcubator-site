define([
  'mixins/SimpleModalView',
  'app/templates/MainTemplates'
],
function(SimpleModalView) {

  var OverviewPageView = Backbone.View.extend({
    css: 'app-page',

    events : {
      'click .tutorial'        : 'showTutorial',
      'click .feedback'        : 'showFeedback',
      'click #deploy'          : 'deploy'
    },

    initialize: function() {
      _.bindAll(this);
      util.loadCSS(this.css);
      this.title = "The Garage";
    },

    render: function() {
      var page_context = {};
      this.el.innerHTML = _.template(util.getHTML('app-main-page'), page_context);
      this.checkTutorialProgress();
    },

    checkTutorialProgress: function() {
      $.ajax({
        type: "POST",
        url: '/log/slide/',
        data: { title: null, directory: null },
        success: function(data) {
          v1.betaCheck(data);
        },
        dataType: "JSON"
      });
    },

    deploy: function() {
      v1.deploy();
    },

    showTutorial: function() {
      v1.showTutorial();
    },

    showFeedback: function() {
      v1.showTutorial(null, [7]);
    }

  });

  return OverviewPageView;
});
