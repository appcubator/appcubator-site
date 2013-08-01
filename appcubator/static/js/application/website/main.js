require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "answer" : "../../libs/answer/answer"
  },

  shim: {
    "underscore": {
      exports: "_"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "prettyCheckable" : {
      deps: ["jquery"]
    }
  }

});

require([
  './HomepageView',
  'backbone',
  'answer',
  'util',
  'prettyCheckable'
],
function(HomepageView) {

  var WebsiteRouter = Backbone.Router.extend({

    routes: {
      // "app/:appid/info/(:tutorial/)"     : "info",
      // "app/:appid/tables/(:tutorial/)"   : "tables",
      // "app/:appid/gallery/(:tutorial/)"  : "themes",
      // "app/:appid/pages/(:tutorial/)"    : "pages",
      // "app/:appid/editor/:pageid/"       : "editor",
      // "app/:appid/mobile-editor/:pageid/": "mobileEditor",
      // "app/:appid/emails/(:tutorial/)"   : "emails",
      // "app/:appid/(:tutorial/)"          : "index",
      "/"                                   : "homepage",
      "/home/"                              : "homepage",
      "home/"                              : "homepage"

    },

    cube: $('#cube'),

    initialize: function() {
      _.bindAll(this);
      this.animateCube();
      this.bindSignupForm();
      document.addEventListener("touchstart", function(){}, true);
    },

    homepage: function() {
      this.view = new HomepageView().render();
    },

    bindSignupForm: function() {

    },

    animateCube: function() {
      if(!this.cube) return;
      $(window).on('scroll', function(e) {
        var xTrans = -30;
        var yTrans = 45;

        var newValue = $(window).scrollTop();
        var newXtrans = Math.round((xTrans + newValue)/3);
        var newYtrans = Math.round((yTrans + newValue)/3);

        var str = 'rotateX('+ newXtrans +'deg) rotateY('+ newYtrans +'deg)';

        $(this.cube).css({
            "webkitTransform":str,
            "MozTransform":str
        });

        var animating = false;
      });
    },

    // animate 

  

    //   $('.btn-facebook').on('click', function() {
    //     FB.login(function(response) {
    //      if (response.authResponse) {
    //       FB.api('/me', function(response) {
    //         $("#inp-name").val(response.name);
    //         $("#inp-email").val(response.email);
    //         $("#inp-company").val(response.work[0].employer.name);
    //         $("#inp-extra").val(JSON.stringify(response));
    //        });
    //      } else {
    //        console.log('User cancelled login or did not fully authorize.');
    //      }
    //    }, {scope: 'email'});
    //   });


    //   $('#member').on('click', function(e) {
    //     $('#bottom-panel').animate({
    //       bottom : 0
    //     }, 200, function() {
    //       $('#id_username').focus();
    //     });
    //   });

    //   $('.slide-info').on('click', function(e) {
    //     $('html, body').animate({ scrollTop: infoHeight }, 'slow');
    //   });
    //   $('.slide-gallery').on('click', function(e) {
    //     $('html, body').animate({ scrollTop: galleryHeight }, 'slow');
    //   });
    //   $('.slide-pricing').on('click', function(e) {
    //     $('html, body').animate({ scrollTop: pricingHeight }, 'slow');
    //   });
    //   $('.slide-signup').on('click', function(e) {
    //     $('html, body').animate({ scrollTop: signupHeight + 40 }, 'slow');
    //   });

    //   IN.Event.on(IN, "auth", function(){ onLinkedInLogin(); });

    //   function onLinkedInLogin() {
    //     IN.API.Profile("me")
    //       .fields(["id", "firstName", "lastName", "publicProfileUrl", "emailAddress", "headline", "three-current-positions"])
    //       .result(login_callback)
    //       .error(function(err) {
    //         alert(err);
    //       });
    //   }
    //   function login_callback(result) {
    //     var fullProfile = result.values[0];
    //     var fullName = fullProfile.firstName + " " + fullProfile.lastName;
    //     var emailAddress = fullProfile.emailAddress;
    //     if(fullProfile.threeCurrentPositions["_total"] > 0) {
    //       var company = fullProfile.threeCurrentPositions.values[0].company.name || "";
    //     }
    //     // fill in form fields
    //     document.getElementById('inp-name').value = fullName;
    //     document.getElementById('inp-email').value = emailAddress;
    //     document.getElementById('inp-company').value = company;
    //   }

    //   $('.IN-widget').hide();
    //   $('.btn-linkedin').on('click', function() {
    //     $('.IN-widget').children().first().children().first().trigger('click');
    //   });

    //   var css = 'prettyCheckable';
    //   var cssFile = document.createElement('link');
    //   cssFile.setAttribute('type', 'text/css');
    //   cssFile.setAttribute('href', '/static/css/' + css + '.css');
    //   cssFile.setAttribute('rel', 'stylesheet');
    //   cssFile.id = 'css-' + css;
    //   document.getElementsByTagName('head')[0].appendChild(cssFile);


    //   $('#sign-up-form').on('submit', function(e) {
    //     e.preventDefault();

    //     obj = {};
    //     obj.name = $("#inp-name").val();
    //     obj.email = $("#inp-email").val();
    //     obj.company = $("#inp-company").val();
    //     obj.extra = $("#inp-extra").val();
    //     obj.interest = $('#inp-interest').prop('checked');
    //     obj.description = $('#inp-description').val();

    //     var isFilled = true;

    //     for (var key in obj) {
    //       var val = obj[key];
    //       if(val === "") {
    //         isFilled = false;
    //         $("#inp-" + key).addClass('required-border');
    //       }
    //       else {
    //         $("#inp-" + key).removeClass('required-border');
    //       }
    //     }

    //     if(isFilled) {
    //        $.ajax({
    //         url: "/signup_form/",
    //         type: "POST",
    //         data: obj,
    //         dataType: "JSON"
    //       });

    //       $('#sign-up-form').hide();
    //       $('.thanks-for-signing').fadeIn();
    //     }
    //   });

    // };


  });

  $(document).ready(function() {
    new WebsiteRouter();
    Backbone.history.start({pushState: true});
});
});
