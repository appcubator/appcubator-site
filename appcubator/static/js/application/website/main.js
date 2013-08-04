var WebsiteApp = {};

require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.filedrop" : "../../libs/jquery/jquery.filedrop",
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
    "answer" : "../../libs/answer/answer",
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
  'backbone',
  'answer',
  'util',
  'prettyCheckable',
  'mixins/BackboneConvenience'
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
      "home/"                              : "homepage"
    },

    cube: $('#cube'),

    initialize: function() {
      _.bindAll(this);
      this.animateCube();
      this.bindLoginForm();
      document.addEventListener("touchstart", function(){}, true);
    },

    homepage: function() {
      console.log("halloooo");
      this.view = new HomepageView().render();
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
