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
  "backbone",
  "iui"
],
function(AppModel, AppRouter, KeyDispatcher, MouseDispatcher) {

  v1State = new AppModel(appState);

  keyDispatcher = new KeyDispatcher();
  mouseDispatcher = new MouseDispatcher();

  describe( "AppRouter", function () {

    beforeEach(function() {
      this.router = new AppRouter();
      Backbone.history.start({pushState: true});
    });

    afterEach(function() {
      Backbone.history.stop();
    });

    it("routes to the info page", function () {
      this.router.navigate('app/1/info/', {trigger: true});
      expect(this.router).toBeDefined();

      this.router.navigate('app/1/info/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the entities", function () {
      this.router.navigate('app/1/entities/', {trigger: true});
      expect(this.router).toBeDefined();

      this.router.navigate('app/1/entities/tutorial/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the theme gallery", function () {
      this.router.navigate('app/1/gallery/', {trigger: true});
      expect(this.router).toBeDefined();

      this.router.navigate('app/1/gallery/tutorial/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the pages", function () {
      this.router.navigate('app/1/pages/', {trigger: true});
      expect(this.router).toBeDefined();

      this.router.navigate('app/1/pages/tutorial/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the email page", function () {
      this.router.navigate('app/1/emails/', {trigger: true});
      expect(this.router).toBeDefined();

      this.router.navigate('app/1/emails/tutorial/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the index", function () {
      this.router.navigate('app/1/', {trigger: true});
      expect(this.router).toBeDefined();

      this.router.navigate('app/1/tutorial/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the editor", function () {
      this.router.navigate('app/1/editor/', {trigger: true});
      expect(this.router).toBeDefined();
    });
    it("routes to the mobile editor", function () {
      this.router.navigate('app/1/mobile-editor/1/', {trigger: true});
      expect(this.router).toBeDefined();
    });
  });
});
