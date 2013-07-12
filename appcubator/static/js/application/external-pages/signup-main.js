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
  'prettyCheckable',
  'underscore'
],
  function() {

    var SignupMain = function() {

    $(document).ready(function() {

      $('#member').on('click', function(e) {
        $('#bottom-panel').animate({
          bottom : 0
        }, 200, function() {
          $('#id_username').focus();
        });
      });

      $('form#signup').submit(function(e) {
          console.log($(e.target).serialize());
          var self = this;
          var ajax_info = {
           type: 'POST',
           url: '/signup/',
           data: $(e.target).serialize(),
           success: function(data, statusStr, xhr) {
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
  };

  $(document).ready(new SignupMain());

});
