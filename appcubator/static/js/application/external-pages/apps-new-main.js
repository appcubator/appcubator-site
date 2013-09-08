require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app"       : "../main-app",
    "util"      : "../../libs/util/util",
    "mixins"          : "../../mixins",
    "backbone"        : "../../libs/backbone-amd/backbone",
    "underscore"      : "../../libs/underscore-amd/underscore",
    "jquery-ui"       : "../../libs/jquery-ui/jquery-ui"
  },

  shim: {
    "bootstrap" : {
      deps: ["jquery"]
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "underscore": {
      exports: "_"
    }
  }

});

require([
  'jquery',
  '../main-app/GarageView'
],
function($, GarageView) {
  $(function () {
      $('form').on('submit', function(e) {
        $(e.target).on('submit', function(e) {
          e.preventDefault();
        });
      });
  });

  $('#skip-racoon').on('click', function() {
    $('form').attr("action", "/app/new/");
    $('form').submit();
  });

  $('#guide-btn').hover(function() {
    $('#mascot').addClass('happy');
  }, function() {
    $('#mascot').removeClass('happy');
  });

  var garage = new GarageView();
  $('.garage-toggle').on('click', garage.show);
});
