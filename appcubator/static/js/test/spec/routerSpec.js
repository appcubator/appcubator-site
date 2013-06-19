var pageId = 3;
var g_editorView;
var appId = 1;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;

define([
  "models/AppModel",
  "app/AppRouter",
  "editor/KeyDispatcher",
  "editor/MouseDispatcher",
  "backbone"
],
function(AppModel, AppRouter, KeyDispatcher, MouseDispatcher) {

  v1State = new AppModel(appState);
  console.log(v1State);

  keyDispatcher = new KeyDispatcher();
  mouseDispatcher = new MouseDispatcher();
  var router = new AppRouter();

  describe( "AppRouter routing functions", function () {
    it("routes to the info page", function () {
      router.navigate('/1/info/', {trigger: true});
      expect(router).toBeDefined();

      router.navigate('/1/info/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the entities", function () {
      router.navigate('/1/entities/', {trigger: true});
      expect(router).toBeDefined();

      router.navigate('/1/entities/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the theme gallery", function () {
      router.navigate('/1/gallery/', {trigger: true});
      expect(router).toBeDefined();

      router.navigate('/1/gallery/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the pages", function () {
      router.navigate('/1/pages/', {trigger: true});
      expect(router).toBeDefined();

      router.navigate('/1/pages/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the editor", function () {
      router.navigate('/1/editor/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the mobile editor", function () {
      router.navigate('/1/mobile-editor/1/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the email page", function () {
      router.navigate('/1/emails/', {trigger: true});
      expect(router).toBeDefined();

      router.navigate('/1/emails/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });
    it("routes to the index", function () {
      router.navigate('/1/', {trigger: true});
      expect(router).toBeDefined();

      router.navigate('/1/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });
  });
});
