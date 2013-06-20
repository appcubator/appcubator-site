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
    var router = null;

    afterEach(function() {
      Backbone.history.stop();
      router = null;
    });

    it("routes to the info page", function () {
      spyOn(AppRouter.prototype, 'info');
      spyOn(AppRouter.prototype, 'showTutorial');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/info/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.info).toHaveBeenCalled();

      router.navigate('app/1/info/tutorial/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
    });

    it("routes to the entities", function () {
      spyOn(AppRouter.prototype, 'entities');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/entities/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.entities).toHaveBeenCalled();

      router.navigate('app/1/entities/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });

    it("routes to the theme gallery", function () {
      spyOn(AppRouter.prototype, 'themes');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/gallery/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.themes).toHaveBeenCalled();

      router.navigate('app/1/gallery/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });

    it("routes to the pages", function () {
      spyOn(AppRouter.prototype, 'pages');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/pages/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.pages).toHaveBeenCalled();

      router.navigate('app/1/pages/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });

    it("routes to the email page", function () {
      spyOn(AppRouter.prototype, 'emails');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/emails/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.emails).toHaveBeenCalled();

      router.navigate('app/1/emails/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });

    it("routes to the index", function () {
      spyOn(AppRouter.prototype, 'index');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.index).toHaveBeenCalled();

      router.navigate('app/1/tutorial/', {trigger: true});
      expect(router).toBeDefined();
    });

    it("routes to the editor", function () {
      spyOn(AppRouter.prototype, 'editor');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/editor/0/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.editor).toHaveBeenCalled();
    });

    it("routes to the mobile editor", function () {
      spyOn(AppRouter.prototype, 'mobileEditor');
      router = new AppRouter();
      Backbone.history.start({pushState: true});

      router.navigate('app/1/mobile-editor/0/', {trigger: true});
      expect(router).toBeDefined();
      expect(AppRouter.prototype.mobileEditor).toHaveBeenCalled();
    });
  });
});
