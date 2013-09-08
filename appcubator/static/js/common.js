require.config({
  paths: {
    "jquery" : "./libs/jquery/jquery",
    "jquery-ui" : "./libs/jquery-ui/jquery-ui",
    "underscore" : "./libs/underscore-amd/underscore",
    "backbone" : "./libs/backbone-amd/backbone",
    "heyoffline": "./libs/heyoffline",
    "util" : "./libs/util/util",
    "util.filepicker" : "./libs/util/util.filepicker",
    "comp": "./libs/util/comp",
    "bootstrap" : "./libs/bootstrap/bootstrap",
    "answer" : "./libs/answer/answer",
    "prettyCheckable" : "./libs/jquery/prettyCheckable",
    "list" : "./libs/list",
    "snap" : "./libs/snap.min",
    "tourist": "./libs/tourist.min",
    "xrayquire" : "./libs/xrayquire",
    "mixins" : "./mixins",
    "app" : "./application/main-app",
    "editor" : "./application/main-app/editor",
    "m-editor" : "./application/main-app/mobile-editor",
    "models" : "./application/data/models",
    "collections" : "./application/data/collections",
    "dicts" : "./application/main-app/dicts",
    "tutorial" : "./application/tutorial"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "underscore": {
      exports: "_"
    },
    "heyoffline": {
      exports: "Heyoffline"
    },
    "backbone": {
      exports: "Backbone",
      deps: ["underscore", "jquery"]
    },
    "bootstrap" : {
      deps: ["jquery"]
    },
    "answer" : {
      deps: ["./libs/answer/lib/natural", "underscore", "jquery"]
    },
    "snap": {
      exports: "Snap"
    },
    "tourist": {
      exports: "Tourist",
      deps: ["jquery", "backbone"]
    },
    "util.filepicker": {
      exports: "util"
    }
  }

});