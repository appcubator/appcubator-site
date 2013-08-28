var WebsiteApp = {};

require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.hotkeys" : "../../libs/jquery/jquery.hotkeys",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "heyoffline": "../../libs/heyoffline",
    "util" : "../../libs/util/util",
    "util.filepicker" : "../../libs/util/util.filepicker",
    "comp": "../../libs/util/comp",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../main-app",
    "editor" : "../main-app/editor",
    "m-editor" : "../main-app/mobile-editor",
    "dicts" : "../main-app/dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "mousetrap" : "../../libs/mousetrap.min",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "snap" : "../../libs/snap.min",
    "tourist": "../../libs/tourist.min",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial",
    "xrayquire" : "../../libs/xrayquire"
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
  './DeveloperpageView',
  './SignupModalView',
  'backbone',
  'util',
  'prettyCheckable',
  'mixins/BackboneConvenience'
],
function(HomepageView, DeveloperpageView, SignupModalView) {

  var WebsiteRouter = Backbone.Router.extend({

    routes: {
      ""                    : "homepage",
      "beta/"               : "homepage",
      "developer/"            : "developerpage",
    },

    cube: $('#cube'),

    initialize: function() {
      _.bindAll(this);
      this.animateCube();
      this.bindLoginForm();
      this.bindSignupForm();
      document.addEventListener("touchstart", function(){}, true);
    },

    homepage: function() {
      this.view = new HomepageView().render();
    },

    developerpage: function() {
      this.view = new DeveloperpageView().render();
    },

    bindLoginForm: function() {
        $('#member').on('click', function(e) {
          $('#bottom-panel').animate({
            bottom : 0
          }, 200, function() {
            $('#id_username').focus();
          });
        });
    },

    bindSignupForm: function() {
      $('.signup-button').on('click', function(e) {
        new SignupModalView();
      });
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
    }
  });

  $(document).ready(function() {
    WebsiteApp = new WebsiteRouter();
    Backbone.history.start({pushState: true});
  });
});
