require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "app" : "../",
    "editor" : "../editor",
    "dicts" : "../../dicts",
    "mixins" : "../../mixins",
    "models" : "../data/models",
    "collections" : "../data/collections"
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
    }
  }

});

require(["ThemesView", '../../libs/keymaster/keymaster'], function(ThemesView) {
  var editorView = new ThemesView();
});
