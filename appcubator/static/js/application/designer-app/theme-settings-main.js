require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "util" : "../../libs/util/util",
    "util.filepicker" : "../../libs/util/util.filepicker",
    "bootstrap" : "../../libs/bootstrap/bootstrap",
    "designer-app" : "./",
    "editor" : "./editor",
    "m-editor" : "./mobile-editor",
    "dicts" : "./dicts",
    "mixins" : "../../mixins",
    "key" : "../../libs/keymaster/keymaster",
    "answer" : "../../libs/answer/answer",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list" : "../../libs/list",
    "models" : "../data/models",
    "collections" : "../data/collections",
    "tutorial" : "../tutorial"
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
    "util.filepicker": {
      deps: ["util"]
    }
  }

});

require([
  "util",
  "util.filepicker",
  "backbone",
  "bootstrap"
],
function(ThemeEditView, ThemeModel) {
  var ThemeSettingsView = Backbone.View.extend({
    initialize: function() {
      _.bindAll(this);
      var self = this;
      $('#change-image').on('click', function() {
        util.filepicker.openFilePick(self.imageChanged, self);
      });
    },

    imageChanged: function(files) {
      var url = files[0].url;
      $.ajax({
        type: "POST",
        url: "/theme/" + themeId + "/edit_image/",
        data: {img: url},
        success: function(data) {
          document.location.reload(true);
        },
        dataType: "JSON"
      });
    }
  });

  var themeSettings = new ThemeSettingsView();
});
