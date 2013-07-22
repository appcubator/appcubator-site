require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "underscore" : "../../libs/underscore-amd/underscore",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable"
  },

  shim: {
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
function(StripeMain) {

  var PaymentsMain = function() {
    new Striper();
    //Striper.bindPayment('#') - Add buttonSelector, formId here.
  };

  $(document).ready(new PaymentsMain());

});
