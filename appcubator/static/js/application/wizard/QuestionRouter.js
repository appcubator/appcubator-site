define([
  "wizard/QuestionView",
  "wizard/wizard-questions"
],
function (QuestionView) {

  var QuestionRouter = Backbone.View.extend({
    answersDict : {},

    initialize: function() {
      _.bindAll(this);
    },

    renderQuestion: function(qDict, arg) {
      var qView = new QuestionView(qDict, arg);
      $('.racoon').append(qView.el);
      return qView;
    },

    next: function(qKey, args) {
      console.log(args);
      if(!qKey || !args.length) {
        return this.renderFinalize();
      }

      var qDict = questions[qKey];
      var qView = this.renderQuestion(qDict, args[0]);

      qView.bind('answer', function(newKey, newAnswers) {
        this.registerAns(qKey, newAnswers);
      }, this);

      if(args.length > 1) {
        qView.bind('answer', function(newQKey, newAnswers) {
          args.shift();
          this.next(qKey, args);
        }, this);
      }
      else if(args.length == 1) {
        qView.bind('answer', function(newQKey, newAnswers) {
          this.next(newQKey, newAnswers);
        }, this);
      }
      $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    },

    registerAns: function(qKey, newAnswers) {
      console.log(qKey+":"+newAnswers);
      if(!this.answersDict[qKey]) this.answersDict[qKey] = [];
      this.answersDict[qKey].push(newAnswers);
      console.log(this.answersDict);
    },

    renderFinalize: function() {
      $('.racoon').append('<li class="finish">Thanks for filling it in. We created most of your app already and it awaits for you to design your pages. <div class="btn">Take Me To My App »</div></li>');
    }

  });

  return QuestionRouter;

});