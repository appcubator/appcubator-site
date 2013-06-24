define([
  "wizard/QuestionView",
  "wizard/wizard-questions"
],
function (QuestionView) {

  var QuestionRouter = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this);
    },

    renderQuestion: function(qDict, arg) {
      var qView = new QuestionView(qDict, arg);
      $('.racoon').append(qView.el);
      return qView;
    },

    next: function(qKey, args) {
      if(!qKey) return;

      var qDict = questions[qKey];
      var qView = this.renderQuestion(qDict, args[0]);

      if(args.length > 1) {
        qView.bind('next', function() {
          args.shift();
          this.next(qKey, args);
        }, this);
      }
      else if(args.length == 1) {
        qView.bind('next', function(newQKey, newArgs) {
          this.next(newQKey, newArgs);
        }, this);
      }
      $("html, body").animate({ scrollTop: $(document).height() }, "slow");
    }

  });

  return QuestionRouter;

});