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
      $('#deploy').find('h4').html('Deploying...');
      v1.deploy(function() {
        $('#deploy').find('h4').html('Go To App');
      });
    },

    showTutorial: function() {
      v1.showTutorial();
    },

    showFeedback: function(e) {
      v1.showTutorial([7]);
      e.preventDefault();
    }

  });

  return OverviewPageView;
});
