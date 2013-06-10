require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
  },

  shim: {
    "bootstrap" : {
      deps: ["jquery"]
    }
  }

});

require([
  'jquery'
],
function($) {
  $(function () {
      $('form').on('submit', function(e) {
        $(e.target).on('submit', function(e) {
          e.preventDefault();
        });
      });
    });

    $('#guid-btn').hover(function() {
      $('#mascot').addClass('happy');
    }, function() {
      $('#mascot').removeClass('happy');
    });
});
