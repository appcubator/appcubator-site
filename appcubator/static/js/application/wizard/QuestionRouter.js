define([
  "wizard/QuestionView",
  "wizard/AppGenerator",
  "wizard/wizard-questions"
  ],

  function (QuestionView, AppGenerator) {

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

      askQuestion: function(qKey, args, isLast) {
        if(!qKey || !args.length) {
          new AppGenerator(this.answersDict);
          return this.renderFinalize();
        }

        var questionView = {};
        if(args.length > 1 && qKey.indexOf('X_') === 0) {
          questionView = this.askSeriesOfQuestions(qKey, args, isLast);
        }
        else {
          questionView = this.askSingleQuestions(qKey, args, isLast);
        }

      },

      askSeriesOfQuestions: function(qKey, args, isLast) {
        var qDict = questions[qKey];
        var qView = this.renderQuestion(qDict, args[0]);

        var newIsLast = false;
        if(args.length == 1) {
          newIsLast = true;
        }

        if(newIsLast) {
          qView.bind('answer', function(newQKey, newAnswers) {
            this.registerAns(qKey, newAnswers);
            this.askQuestion(newQKey, newAnswers);
          }, this);
        }
        else {
          qView.bind('answer', function(newQKey, newAnswers) {
            this.registerAns(qKey, newAnswers);
            args.shift();
            this.askSeriesOfQuestions(qKey, args, newIsLast);
          }, this);
        }

        return qView;
      },

      askSingleQuestions: function(qKey, args, isLast) {
        var qDict = questions[qKey];
        var qView = this.renderQuestion(qDict, args[0]);

        qView.bind('answer', function(newQKey, newAnswers) {
          this.registerAns(qKey, newAnswers);
          this.askQuestion(newQKey, newAnswers);
        }, this);

        //qView.bind("answer", this.registerAns);

        return qView;
      },

      registerAns: function(qKey, newAnswers) {
        console.log(qKey + ":" + newAnswers);
        if(!this.answersDict[qKey]) this.answersDict[qKey] = [];
        this.answersDict[qKey].push(_.clone(newAnswers));
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");

      },

      renderFinalize: function() {
        $('.racoon').append('<li class="finish">Thanks for filling it in. We created most of your app already and it awaits for you to design your pages. <div class="btn">Take Me To My App »</div></li>');
      }

    });

return QuestionRouter;

});