require.config({
  paths: {
    "jquery" : "../../libs/jquery/jquery",
    "jquery-ui" : "../../libs/jquery-ui/jquery-ui",
    "underscore" : "../../libs/underscore-amd/underscore",
    "backbone" : "../../libs/backbone-amd/backbone",
    "backboneui" : "../../backbone/BackboneUI",
    "key" : "../../libs/keymaster/keymaster",
    "util" : "../../libs/util/util",
    "app" : "../../app",
    "editor" : "../../app/editor",
    "dicts" : "../../dicts"
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

var pageId = 3;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;

require([
  "editor/EditorView",
  '../lib/jasmine-1.3.1/jasmine',
  '../lib/jasmine-1.3.1/jasmine-html',
  '../../libs/keymaster/keymaster',
  './appState', './defaultElements',
  'dicts/design-options',
  './uieState'
], function(EditorView) {

  var editorView = new EditorView();
  g_editorView = editorView;
  g_appState = appState;
  g_initial_appState = _.clone(appState);

  describe( "appState model input-outputs", function () {  
    it("doesnt fuck up", function () {
      alert('hey');
      editorView.save();
      expect(appState).toEqual(g_initial_appState);  
    });
  });

console.log(jasmine);

// jasmine.getEnv().addReporter(
// new jasmine.HtmlReporter()
// );
 
// // Run all the loaded test specs.
// jasmine.getEnv().execute();

      var jasmineEnv = jasmine.getEnv();
      jasmineEnv.updateInterval = 1000;

      var htmlReporter = new jasmine.HtmlReporter();

      jasmineEnv.addReporter(htmlReporter);

      jasmineEnv.specFilter = function(spec) {
        return htmlReporter.specFilter(spec);
      };

      var currentWindowOnload = window.onload;

      window.onload = function() {
        if (currentWindowOnload) {
          currentWindowOnload();
        }
        execJasmine();
      };

      function execJasmine() {
        jasmineEnv.execute();
      }


});
