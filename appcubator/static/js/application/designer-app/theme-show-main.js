require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "jquery.hotkeys" : "../../libs/jquery/jquery.hotkeys",
    "fontselect": "../../libs/fontselect/jquery.fontselect",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
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
    "ace" : "http://rawgithub.com/ajaxorg/ace-builds/master/src-noconflict/ace"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    'fontselect': {
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
});
