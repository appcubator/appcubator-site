require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.hotkeys" : "../../libs/jquery/jquery.hotkeys",
    "fontselect": "../../libs/fontselect/jquery.fontselect",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "util.filepicker" : "../../libs/util/util.filepicker",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "designer-app" : "./",
    "editor" : "../main-app/editor",
    "m-editor" : "./mobile-editor",
    "dicts" : "./dicts",
    "mixins" : "../../mixins",
    "answer" : "../../libs/answer/answer",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial",
    "ace" : "https://d1n0x3qji82z53.cloudfront.net/src-min-noconflict/ace"
  },

  shim: {
    "util.filepicker": {
      deps: ['util']
    },
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    'fontselect': {
      exports: "$",
      deps: ['jquery']
    },
    'jquery.hotkeys': {
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
    }
  }

});

require([
  "designer-app/ThemeEditView",
  'models/ThemeModel',
  "editor/KeyDispatcher",
  "mixins/BackboneConvenience",
  "bootstrap",
  "ace"
],
function(ThemeEditView, ThemeModel, KeyDispatcher) {
  
  keyDispatcher  = new KeyDispatcher();
  var themeModel = new ThemeModel(themeState);
  var galleryView = new ThemeEditView(themeModel);
  keyDispatcher.bindComb('meta+s', galleryView.save);
  keyDispatcher.bindComb('ctrl+s', galleryView.save);

  var WebsiteRouter = Backbone.Router.extend({

    routes: {
      "app/:appid/edit_theme/:page_name/"   : "showElement",
      "theme/:appid/:page_name/"            : "showElement"
    },

    initialize: function() {
      _.bindAll(this);
      document.addEventListener("touchstart", function(){}, true);
      console.log("INITTT");
    },

    showElement: function(appId, elementName) {
      console.log(elementName);
      galleryView.showElement(elementName);
    }
  });

  var WebsiteApp = new WebsiteRouter();
  Backbone.history.start({pushState: true});

  $(document).on('click', 'a[rel!="external"]', function(e) {
      var href = e.currentTarget.getAttribute('href') || "";
      // if internal link, navigate with router
      if(href.indexOf('/app/'+appId+'/') === 0||
         href.indexOf('/theme/'+themeId+'/') === 0) {
        WebsiteApp.navigate(href, {trigger: true});
        return false;
      }
  });

  $('.left-nav').affix({offset: 0});

});
