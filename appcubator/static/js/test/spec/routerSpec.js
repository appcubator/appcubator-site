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
  "util",
  "mixins/BackboneConvenience"
],
function(AppModel, AppRouter, KeyDispatcher, MouseDispatcher) {

  v1State = new AppModel(appState);

  keyDispatcher = new KeyDispatcher();
  mouseDispatcher = new MouseDispatcher();

  describe( "AppRouter", function () {

    describe("info page", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the info page route', function() {
        spyOn(AppRouter.prototype, 'info');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/info/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.info).toHaveBeenCalled();
      });

      it('calls the info page tutorial', function() {
        ///spyOn(AppRouter.prototype, 'showTutorial');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/info/tutorial/', {trigger: true});

        expect(router).toBeDefined();
        ///expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
      });
    });

    describe("tables", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the tables page route', function() {
        spyOn(AppRouter.prototype, 'tables');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/tables/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.tables).toHaveBeenCalled();
      });

      it('calls the tables page tutorial', function() {
        ///spyOn(AppRouter.prototype, 'showTutorial');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/tables/tutorial/', {trigger: true});

        expect(router).toBeDefined();
        ///expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
      });
    });

    describe("theme gallery", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the themes page route', function() {
        spyOn(AppRouter.prototype, 'themes');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/gallery/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.themes).toHaveBeenCalled();
      });

      it('calls the themes page tutorial', function() {
        ///spyOn(AppRouter.prototype, 'showTutorial');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/themes/tutorial/', {trigger: true});

        expect(router).toBeDefined();
        ///expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
      });
    });

    describe("pages", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the pages page route', function() {
        spyOn(AppRouter.prototype, 'pages');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/pages/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.pages).toHaveBeenCalled();
      });

      it('calls the pages page tutorial', function() {
        ///spyOn(AppRouter.prototype, 'showTutorial');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/pages/tutorial/', {trigger: true});

        expect(router).toBeDefined();
        ///expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
      });
    });

    describe("email page", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the emails page route', function() {
        spyOn(AppRouter.prototype, 'emails');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/emails/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.emails).toHaveBeenCalled();
      });

      it('calls the emails page tutorial', function() {
        ///spyOn(AppRouter.prototype, 'showTutorial');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/emails/tutorial/', {trigger: true});

        expect(router).toBeDefined();
        ///expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
      });
    });

    describe("index", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the index page route', function() {
        spyOn(AppRouter.prototype, 'index');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.index).toHaveBeenCalled();
      });

      it('calls the index page tutorial', function() {
        ///spyOn(AppRouter.prototype, 'showTutorial');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/tutorial/', {trigger: true});

        expect(router).toBeDefined();
        ///expect(AppRouter.prototype.showTutorial).toHaveBeenCalled();
      });
    });

    describe("editor", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the editor page route', function() {
        spyOn(AppRouter.prototype, 'editor');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/editor/0/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.editor).toHaveBeenCalled();
      });
    });

    describe("mobile editor", function () {
      var router = null;

      afterEach(function() {
        Backbone.history.stop();
        router = null;
      });

      it('calls the mobile editor page route', function() {
        spyOn(AppRouter.prototype, 'mobileEditor');
        router = new AppRouter();
        Backbone.history.start({pushState: true});

        router.navigate('app/1/mobile-editor/0/', {trigger: true});

        expect(router).toBeDefined();
        expect(AppRouter.prototype.mobileEditor).toHaveBeenCalled();
      });
    });
  });
});
