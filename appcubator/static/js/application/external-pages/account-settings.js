require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "underscore" : "../../libs/underscore-amd/underscore",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../main-app",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
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
    },
    "bootstrap" : {
      deps: ["jquery"]
    }
  }

});

require([
  'app/Striper',
  'bootstrap'
],
function(Striper) {

  var PaymentsMain = function() {
    var striper = new Striper();
    striper.bindChangeCard('.change-card', 'change-card-form');
    striper.onSuccess = function() {
      window.location = "/account/";
    };

    striper.bindChangePlan('#change-plan-btn','change-subscription');
    striper.bindCancel('#cancel-btn','cancel-form');
  };

  $(document).ready(new PaymentsMain());


  this.$nav = $('.navigator .left-nav');

      // make left nav links scroll page
  this.$nav.find('a').click(function() {
    var elem = this.getAttribute('href');
    var topPos = $(elem).offset().top - 75;
    $('html,body').animate({scrollTop: topPos});
    return false;
  });

  $('.left-nav').affix({offset: 0});

  $('#add-key-btn').on('click', function() {
    $('#add-key-btn').hide();
    $('#add-key-panel').fadeIn();
  });

  // @ksikka's code
  $(document).ready(function() {
    $('form').not('.no-ajax').each(function(ind, node) {
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
                  $(self).find('.form-error.field-all').html(val.join('<br />')).show();
                } else {
                  $(self).find('.form-error.field-name-'+key).html(val.join('<br />')).show();
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
