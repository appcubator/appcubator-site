require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "iui" : "../../libs/iui/iui",
    "comp": "../../libs/iui/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "editor" : "./../editor",
    "dicts" : "../../dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable"
  },

  shim: {
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
    "prettyCheckable" : {
      deps: ["jquery"]
    }
  }

});

require([
  'mixins/SimpleModalView',
  'app/main-app/LoginModalView',
  'prettyCheckable'
],
function(SimpleModalView, LoginModalView) {

  var HomeMain = function() {

    var xTrans = -30;
    var yTrans = 45;
    var pageHeight = $(window).height();
    var bg = 1;

    $(window).on('scroll', function(e) {
      var newValue = $(window).scrollTop();
      var newXtrans = xTrans + newValue;
      var newYtrans = yTrans + newValue;
      var str = 'rotateX('+ newXtrans +'deg) rotateY('+ newYtrans +'deg)';
      $('#cube').css({
          "webkitTransform":str,
          "MozTransform":str
      });

      if(newValue > pageHeight && bg ==1) {
        bg = 2;
        $('#background-img').css('background-image', 'url(/static/img/bg3.jpg)');
      }

      if(newValue < pageHeight && bg == 2) {
        bg = 1;
        $('#background-img').css('background-image', 'url(/static/img/bg2.jpg)');
      }

    });

    $('.btn-facebook').on('click', function() {
      FB.login(function(response) {
       if (response.authResponse) {
        FB.api('/me', function(response) {
          $("#inp-name").val(response.name);
          $("#inp-email").val(response.email);
          $("#inp-company").val(response.work[0].employer.name);
          $("#inp-extra").val(JSON.stringify(response));
         });
       } else {
         console.log('User cancelled login or did not fully authorize.');
       }
     }, {scope: 'email'});
    });


    $('#member').on('click', function(e) {
      $('#bottom-panel').animate({
        bottom : 0
      }, 200, function() {
        $('#id_username').focus();
      });
    });

    $('#request').on('click', function(e) {
      $('html, body').animate({ scrollTop: $(document).height()-$(window).height() }, 'slow');
    });

    IN.Event.on(IN, "auth", function(){ onLinkedInLogin(); });

    function onLinkedInLogin() {
      IN.API.Profile("me")
        .fields(["id", "firstName", "lastName", "publicProfileUrl", "emailAddress", "headline"])
        .result(login_callback)
        .error(function(err) {
          alert(err);
        });
    }
    function login_callback(result) {
      var realresult = result.values[0];
        $.post('/connect_with/', realresult, function(data){
          new SimpleModalView({ text: "Thanks for expressing interest, "+realresult.firstName+", we will reach out to you soon."});
        });
    }

    $('.IN-widget').hide();
    $('#request').on('click', function() {
      $('.IN-widget').children().first().children().first().trigger('click');
    });

    $('#login-btn').on('click', function() {
      new LoginModalView();
    });

    iui.loadCSS('prettyCheckable');
    $('input[type=checkbox]').prettyCheckable();
    $('input[type=radio]').prettyCheckable();
  };

  new HomeMain();
});
