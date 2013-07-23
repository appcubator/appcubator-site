require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "answer" : "../../libs/answer/answer",
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
  'answer',
  'util'
],
function() {

  var DocumentationMain = Backbone.View.extend({
    el: null,
    addr : [0],

    events : {
      "submit .tutorial-q-form" : "submittedQuestion"
    },

    initialize: function(directory) {
      _.bindAll(this);
      this.el = document.getElementById('page');
      this.form = document.getElementById('feedback-form');
      console.log(this.form);
      this.render();
    },

    render : function(img, text) {
      console.log(this.el);
      $(this.form).on('submit', this.submittedFeedback);
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
    }

  });

  $(document).ready(new DocumentationMain());
});
