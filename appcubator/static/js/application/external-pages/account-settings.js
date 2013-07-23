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
    striper.bindPayment('.change-card', 'change-card-form');
    striper.onSuccess = function() {
      window.location = "/account/";
    };
  };

  $(document).ready(new PaymentsMain());

  // @ksikka's code
  $(document).ready(function() {
    $('form').each(function(ind, node) {

      $(node).submit(function(e) {
        var self = this;
        var ajax_info = {
          type : $(node).attr('method'),
          url  : $(node).attr('action'),
          data : $(node).serialize(),
          success : function(data, statusStr, xhr) {
            if (typeof(data.redirect_to) !== 'undefined') {
              location.href = data.redirect_to;
            } else {
              _.each(data, function(val, key, ind) {
                if(key==='__all__') {
                  $(self).find('.form-error.field-all').html(val.join('<br />'));
                } else {
                  $(self).find('.form-error.field-name-'+key).html(val.join('<br />'));
                }
              });
            }
          }
        };
        $.ajax(ajax_info);
        $(self).find('.form-error').html("");

        return false;

      });

    });
  });
});
