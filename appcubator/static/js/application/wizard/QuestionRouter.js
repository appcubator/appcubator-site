define([
  "wizard/QuestionView",
  "wizard/AppGenerator",
  "mixins/ErrorModalView",
  "wizard/wizard-questions"
  ],

  function (QuestionView, AppGenerator, ErrorModalView) {

    var QuestionRouter = Backbone.View.extend({
      answersDict : {},
      generatedJSON: null,

      events : {
        'click .done-walkthrough' : 'saveGeneratedApp'
      },

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
          // # python ... do you speak it?
          utils.log_to_server('answers', { answers_dict: JSON.stringify(this.answersDict) }, appId);
          var appGen = new AppGenerator(this.answersDict);
          this.generatedJSON = appGen.getJSON();
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
        if(!this.answersDict[qKey]) this.answersDict[qKey] = [];
        this.answersDict[qKey].push(_.clone(newAnswers));
        $("html, body").animate({ scrollTop: $(document).height() }, "slow");
      },

      renderFinalize: function() {
        //$('.racoon').append('<li class="finish">Thanks for filling it in. We created most of your app already and it awaits for you to design your pages. <div class="btn done-walkthrough">Take Me To My App »</div></li>');
        //$('.done-walkthrough').on('click', this.saveGeneratedApp);
        $(".bottom-panel").append('<div class="racoon-thinking"></div>');
        this.saveGeneratedApp();
      },

      renderRacoon: function(url) {
        $(".bottom-panel").html('');
        $(".bottom-panel").append('<div class="racoon-speech"></div><div class="bubble">Your app is available here:<br  /><a target="_blank" href="'+url+'">'+url+'</a></div>');
      },

      saveGeneratedApp: function() {
        var self = this;
        $.ajax({
          type: "POST",
          url: '/app/'+appId+'/state/',
          data: JSON.stringify(this.generatedJSON),
          success: function(data) {
            // document.location.href='/app/' + appId + '/';
            console.log(data);
            self.deploy();
          },
          error: function(data) {
            if(data.responseText == "ok") return;
            var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
            if(DEBUG) {
              content = { text: data.responseText };
            }
            new ErrorModalView(content);
          },
          dataType: "JSON"
        });
      },

      deploy: function() {
        var self = this;
        $.ajax({
          type: "POST",
          url: '/app/'+appId+'/deploy/',
          data: JSON.stringify(this.generatedJSON),
          success: function(data) {
            // document.location.href='/app/' + appId + '/';
            console.log(data);
            self.renderRacoon(data.site_url);
          },
          error: function(data) {
            if(data.responseText == "ok") return;
            var content = { text: "There has been a problem. Please refresh your page. We're really sorry for the inconvenience and will be fixing it very soon." };
            if(DEBUG) {
              content = { text: data.responseText };
            }
            new ErrorModalView(content);
          },
          dataType: "JSON"
        });
      }

    });

return QuestionRouter;

});
