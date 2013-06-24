require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.filedrop" : "../../libs/jquery/jquery.filedrop",
    "jquery.flexslider" : "../../libs/jquery/jquery.flexslider-min",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "comp": "../../libs/util/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "./",
    "editor" : "./editor",
    "dicts" : "./dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "answer" : "../../libs/answer/answer",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial",
    "wizard" : "./"
  },

  shim: {
    "prettyCheckable": {
      deps: ['jquery']
    },
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    },
    "answer" : {
      deps: ["../../libs/answer/lib/natural", "underscore", "jquery"]
    }
  }

});

//libs
require([
  "wizard/QuestionView",
  "wizard/QuestionRouter",
  "wizard/wizard-questions",
  "backbone",
  "bootstrap",
  "util",
  "comp",
  'prettyCheckable'
],
function (QuestionView, QuestionRouter) {

  var WizardView = Backbone.View.extend({

    initialize: function() {
      _.bindAll(this);
      this.questionRouter = new QuestionRouter();
      this.questionRouter.next("category", [""]);
    }

  });

  new WizardView();

});
