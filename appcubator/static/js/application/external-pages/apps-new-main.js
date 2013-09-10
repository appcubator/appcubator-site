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

  var currentTemplate = null;

  $(function () {
      $('form').on('submit', function(e) {
        $(e.target).on('submit', function(e) {
          e.preventDefault();
        });
      });
  });

  $('#skip-racoon').on('click', function() {
    var url = "/app/new/";
    if(currentTemplate) url = url + "template/" +currentTemplate + "/";
    $('form').attr("action", url);
    $('form').submit();
  });

  $('.app-template').click(function(e) {
    if($(e.currentTarget).hasClass('selected')) {
      currentTemplate = null;
      $('.selected').removeClass('selected');
    }
    else {
      $('.selected').removeClass('selected');
      $(e.currentTarget).addClass('selected');
      currentTemplate = e.currentTarget.id;
    }
  });

  $('#guide-btn').hover(function() {
    $('#mascot').addClass('happy');
  }, function() {
    $('#mascot').removeClass('happy');
  });

  var garage = new GarageView();
  $('.garage-toggle').on('click', garage.show);
});
