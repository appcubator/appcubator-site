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
],
function() {

  var HomeMain = function() {

    var xTrans = -30;
    var yTrans = 45;

    var bg = 1;

    $('#bg2').css('background-image', 'url(/static/img/bg3.jpg)');
    $('#bg3').css('background-image', 'url(/static/img/bg4.jpg)');
    $('#bg4').css('background-image', 'url(/static/img/bg4.jpg)');

    $(window).on('scroll', function(e) {
      var newValue = $(window).scrollTop();
      var newXtrans = xTrans + newValue;
      var newYtrans = yTrans + newValue;
      var str = 'rotateX('+ newXtrans +'deg) rotateY('+ newYtrans +'deg)';
      $('#cube').css({
          "webkitTransform":str,
          "MozTransform":str
      });

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


    IN.Event.on(IN, "auth", function(){ onLinkedInLogin(); });

    function onLinkedInLogin() {
      IN.API.Profile("me")
        .fields(["id", "firstName", "lastName", "publicProfileUrl", "emailAddress", "headline", "three-current-positions"])
        .result(login_callback)
        .error(function(err) {
          alert(err);
        });
    }
    function login_callback(result) {
      var fullProfile = result.values[0];
      var fullName = fullProfile.firstName + " " + fullProfile.lastName;
      var emailAddress = fullProfile.emailAddress;
      if(fullProfile.threeCurrentPositions["_total"] > 0) {
        var company = fullProfile.threeCurrentPositions.values[0].company.name || "";
      }
      // fill in form fields
      document.getElementById('inp-name').value = fullName;
      document.getElementById('inp-email').value = emailAddress;
      document.getElementById('inp-company').value = company;
    }

    $('.IN-widget').hide();
    $('.btn-linkedin').on('click', function() {
      $('.IN-widget').children().first().children().first().trigger('click');
    });

    var css = 'prettyCheckable';
    var cssFile = document.createElement('link');
    cssFile.setAttribute('type', 'text/css');
    cssFile.setAttribute('href', '/static/css/' + css + '.css');
    cssFile.setAttribute('rel', 'stylesheet');
    cssFile.id = 'css-' + css;
    document.getElementsByTagName('head')[0].appendChild(cssFile);

    $('input[type=checkbox]').prettyCheckable();
    $('input[type=radio]').prettyCheckable();

    $('#sign-up-form').on('submit', function(e) {
      e.preventDefault();

      obj = {};
      obj.name = $("#inp-name").val();
      obj.email = $("#inp-email").val();
      obj.company = $("#inp-company").val();
      obj.extra = $("#inp-extra").val();
      obj.interest = $('#inp-interest').prop('checked');
      obj.description = $('#inp-description').val();

      var isFilled = true;

      for (var key in obj) {
        var val = obj[key];
        if(val === "") {
          isFilled = false;
          $("#inp-" + key).addClass('required-border');
        }
        else {
          $("#inp-" + key).removeClass('required-border');
        }
      }

      if(isFilled) {
         $.ajax({
          url: "/signup_form/",
          type: "POST",
          data: obj,
          dataType: "JSON"
        });

        $('#sign-up-form').hide();
        $('.thanks-for-signing').fadeIn();
      }
    });

    $('#request').on('click', function() { window.location.href = "/";})

    document.addEventListener("touchstart", function(){}, true);
  };

  $(document).ready(new HomeMain());

});
