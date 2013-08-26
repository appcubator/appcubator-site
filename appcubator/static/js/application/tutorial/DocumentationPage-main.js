require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
  },

  shim: {
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "prettyCheckable" : {
      deps: ["jquery"]
    }
  }

});

require([
  'backbone',
  './TutorialDict',
  'util'
],
function() {

  var DocumentationMain = Backbone.View.extend({
    el: '#page',

    events : {
      "submit .tutorial-q-form" : "submittedQuestion",
      'click .menu-list form img' : 'submitSearchForm',
      'click .prev.arrow' : 'previousPage',
      'click .next.arrow' : 'nextPage'
    },

    initialize: function() {
      _.bindAll(this);
      this.form = document.getElementById('feedback-form');
      this.pages = _.pluck(TutorialDirectory, 'view');
      this.pages = _.map(this.pages, function(title) {
        return title.replace('tutorial-', '').replace('-','_');
      });
      console.log(this.pages);
      this.ind = this.getCurrentIndex();
      this.render();
    },

    render : function(img, text) {
      $(this.form).on('submit', this.submittedFeedback);
      // hide next or prev btns when applicable
      if(this.ind === 0) {
        console.log('lol');
        $('.prev.arrow').hide();
      }
      if(this.ind === this.pages.length - 1) {
        $('.next.arrow').hide();
      }
      return this;
    },

    submittedQuestion: function(e) {
      e.preventDefault();
      var question = this.$el.find('.q-input').val();
      var results = this.reader.match(question);
      this.showQuestionSlide(question, results);

      util.log_to_server('asked question', {directory: null, title: question}, appId);
    },

    submittedFeedback: function(e) {
      e.preventDefault();
      var response = {};
      response.like = $('#like-appcubator').val();
      response.dislike = $('#dislike-appcubator').val();
      response.features = $('#features-appcubator').val();

      util.log_to_server('posted feedback', response, 0);

      $('#feedback-check').prop('checked', true);
      $('#feedback-form').html("<p>We have received your feedback! Thank you for your helping us make Appcubator better.</p>");
    },

    submitSearchForm: function(e) {
      $(e.target.parentNode).submit();
    },

    getCurrentIndex: function() {
      var index = this.pages.indexOf(pageName);
      return (index > -1) ? index : 0;
    },

    getNextPageName: function() {
      return this.pages[this.getCurrentIndex() + 1];
    },

    getPrevPageName: function() {
      return this.pages[this.getCurrentIndex() - 1];
    },

    nextPage: function (e) {
      window.location = '/documentation/' + this.getNextPageName() + '/';
    },

    previousPage: function (e) {
      window.location = '/documentation/' + this.getPrevPageName() + '/';
    }

  });

  $(document).ready(new DocumentationMain());
});
