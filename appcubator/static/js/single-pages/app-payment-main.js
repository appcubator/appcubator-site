require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "underscore" : "../../libs/underscore-amd/underscore",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../main-app",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "mixins" : "../../mixins",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui"

  },

  shim: {
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "underscore": {
      exports: "_"
    },
    "prettyCheckable" : {
      deps: ["jquery"]
    }
  }

});

require([
  'app/Striper'
],
function(Striper) {

  var PaymentsMain = function() {
    var striper = new Striper();
    striper.bindChangePlan('#payment-btn', 'subscribe-form');
    striper.onSuccess = function() {
      window.location = "/app/" + appId + "/info/";
    };
  };

  $(document).ready(new PaymentsMain());

});
