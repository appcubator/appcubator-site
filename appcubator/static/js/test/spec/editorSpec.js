require.config({
  paths: {
    "jquery"          : "../../libs/jquery/jquery",
    "jquery-ui"       : "../../libs/jquery-ui/jquery-ui",
    "jquery.hotkeys"  : "../../libs/jquery/jquery.hotkeys",
    "underscore"      : "../../libs/underscore-amd/underscore",
    "backbone"        : "../../libs/backbone-amd/backbone",
    "react"           : "../../libs/react",
    "heyoffline"      : "../../libs/heyoffline",
    "util"            : "../../libs/util/util",
    "util.filepicker" : "../../libs/util/util.filepicker",
    "comp"            : "../../libs/util/comp",
    "bootstrap"       : "../../libs/bootstrap/bootstrap",
    "app"             : "../../application/main-app",
    "editor"          : "../../application/main-app/editor",
    "m-editor"        : "../../application/main-app/mobile-editor",
    "dicts"           : "../../application/main-app/dicts",
    "mixins"          : "../../mixins",
    "prettyCheckable" : "../../libs/jquery/prettyCheckable",
    "list"            : "../../libs/list",
    "snap"            : "../../libs/snap.min",
    "tourist"         : "../../libs/tourist.min",
    "tourist-omer"    : "../../libs/tourist-omer",
    "models"          : "../../application/data/models",
    "collections"     : "../../application/data/collections",
    "tutorial"        : "../../application/tutorial",
    "wizard"          : "../../application/wizard",
    "xrayquire"       : "../../libs/xrayquire"
  },

  shim: {
    "jquery-ui": {
      exports: "$",
      deps: ['jquery']
    },
    "jquery.hotkeys" : {
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
    "snap": {
      exports: "Snap"
    },
    "tourist": {
      exports: "Tourist",
      deps: ["backbone"]
    },
    "tourist-omer": {
      exports: "TouristOmer",
      deps: ["tourist"]
    },
    "util.filepicker": {
      exports: "util"
    },
    "react" : {
      exports: "React"
    }
  }
});

var pageId = 0;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
GRID_WIDTH = 80;
GRID_HEIGHT = 15;
var v1State = {};

define([
  "editor/EditorView",
  "models/AppModel",
  "models/UserTableModel",
  "collections/PageCollection",
  "collections/MobilePageCollection",
  "collections/UserRolesCollection",
  "editor/KeyDispatcher",
  "editor/MouseDispatcher",
  "react",
  "comp",
  "backbone",
  "mixins/BackboneConvenience",
  "../lib/console-runner"
  ],
  function( EditorView,
    AppModel,
    UserEntityModel,
    PageCollection,
    MobilePageCollection,
    UserRolesCollection,
    KeyDispatcher,
    MouseDispatcher,
    react) {


    util.loadCSS = function(str) { };

    v1State = new Backbone.Model();
    v1State = new AppModel(appState);
    v1State.set('pages', new PageCollection(appState.pages||[]));
    v1State.set('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

    g_guides = {};
    keyDispatcher  = new KeyDispatcher();
    mouseDispatcher  = new MouseDispatcher();

    var AppRouter = {};
    $('.page').fadeOut();
    AppRouter.tutorialPage = "Editor";

    if(AppRouter.view) AppRouter.view.remove();
    var cleanDiv = document.createElement('div');
    cleanDiv.className = "clean-div editor-page";
    $(document.body).append(cleanDiv);

    AppRouter.view  = new EditorView({pageId: pageId});
    AppRouter.view.setElement(cleanDiv).render();

    var fEvent = {};
    var fUi = {};
    fEvent.type = "drop";
    fEvent.pageX = 20;
    fEvent.pageY = 20;

    var getValidation = function(data, callback) {
      console.log(data);
      $.ajax({
        type: "POST",
        url: "/backend/validate/",
        data: JSON.stringify(data),
        complete: callback
      });
    };

    var validateDeleteable = function(model) {
      var button = document.getElementById('delete-widget');
      expect(button).not.toBe(null);

      $(button).trigger('click');
      var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
      expect(droppedEl).toBe(null);
    };

    var validateBackend = function() {

      var callback = jasmine.createSpy();

      getValidation(v1State.serialize(), callback);
      waitsFor(function() {
        return callback.callCount > 0;
      });
      runs(function(data) {
        expect(callback.mostRecentCall.args[1]).toEqual("success");
        expect(callback.mostRecentCall.args[0].responseText).toEqual("Swag!");
      });

    };

    describe("Local Login Form", function () {

      var id = "entity-user-Local_Login";
      var className = "login ui-draggable";
      var loginForm = document.getElementById(id);
      var model1 = {};

      it("is on gallery.", function () {
        expect(loginForm).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = loginForm;

        /* Check if exists */
        var m = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + m.cid);
        expect(droppedEl).not.toBe(null);
        model1 = _.clone(m);
      });

      it("is valid on the backend", function() {
        /* Check validation */
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model1);
      });

    });

    describe("Sign Up Form", function () {

      var id = "entity-user-User";
      var className = "signup ui-draggable";
      var galleryElement = document.getElementById(id);
      var MD;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped on the editor", function() {

        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        MD = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + MD.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        /* Check validation */
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(MD);
      });

    });

    describe("Facebook Login Form", function () {
      var id = "entity-user-facebook";
      var className = "thirdparty ui-draggable";
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {     /* Check if on gallery */
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);

      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Twitter Login Form", function () {
      var id = "entity-user-twitter";
      var className = "thirdparty ui-draggable";
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped on the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });


    describe("LinkedIn Login Form", function () {
      var id = "entity-user-linkedin";
      var className = "thirdparty ui-draggable";
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Current User", function () {
      var className = 'current-user ui-draggable';
      var id = 'current-user-c4';
      var galleryElement = document.getElementById(id);
      var model;

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Create Form", function () {
      var className = 'entity-create-form ui-draggable';
      var id = 'entity-c11';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("List", function () {
      var className = 'entity-list ui-draggable';
      var id = 'entity-c11';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });
    });


    describe("Search Box", function () {
      var className = 'entity-searchbox full-width ui-draggable';
      var id = 'entity-c11';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });
    });


    describe("Search List", function () {
      var className = 'entity-searchlist full-width ui-draggable';
      var id = 'entity-c11';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });
    });

    describe("Image Node", function () {
      var className = 'uielement ui-draggable';
      var id = 'type-images';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });
    });

    describe("Header Node", function () {
      var className = 'uielement ui-draggable';
      var id = 'type-headerTexts';
      var galleryElement = document.getElementById(id);
      var model;

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Text Node", function () {
      var className = 'uielement ui-draggable';
      var id = 'type-texts';
      var galleryElement = document.getElementById(id);
      var model;

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Link Node", function () {
      var className = 'uielement ui-draggable';
      var id = 'type-links';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });
    });

    describe("Line Node", function () {
      var className = 'uielement ui-draggable';
      var id = 'type-lines';
      var galleryElement = document.getElementById(id);
      var model;

       it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Box Node", function () {
      var className = 'uielement ui-draggable';
      var id = 'type-boxes';
      var galleryElement = document.getElementById(id);
      var model;

      it("is on gallery", function() {
        expect(galleryElement).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        var fE = _.clone(fEvent);
        fE.target = galleryElement;

        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("is valid on the backend", function() {
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe('Navbar', function() {
      var model = v1State.get('pages').at(pageId).get('navbar');
      var links = model.get('links');
      var navbar = AppRouter.view.navbar;

      it('renders the brandName', function() {
        //set brandName to appState name to start
        var view_brandName = navbar.$('#brand-name').text();
        var model_brandName = model.get('brandName') || v1State.get('name');
        expect(model_brandName).toEqual(view_brandName);
      });

      it('updates the brandName', function() {
        var old_brandname = model.get('brandName') || v1State.get('name');
        model.set('brandName', "DERPY");
        var brandName = document.getElementById('brand-name').innerHTML;
        expect("DERPY").toEqual(brandName);
      });

      it('renders correct number of elements', function() {
        var numLinks = links.length;
        var numListItems = navbar.$('#links li').length;
        expect(numLinks).toEqual(numListItems);
      });

      it('adds new links to navbar', function() {
        var initialLength = $(navbar.el).find('#links li').length;
        links.add({
          title: "DERPTASTIC",
          url: 'http://www.google.com/'
        });
        var after = $(navbar.el).find('#links li');
        var finalLength = after.length;
        expect(finalLength).toEqual(initialLength + 1);
        var lastLink = after.last()[0].children[0];
        expect(lastLink.innerHTML).toEqual('DERPTASTIC');
      });

      it('removes links from navbar', function() {
        var initialLength = $(navbar.el).find('#links li').length;
        links.remove(links.first());
        var finalLength = $(navbar.el).find('#links li').length;
        expect(finalLength).toEqual(initialLength - 1);
      });
    });

    describe('Footer', function() {
      var model = v1State.get('pages').at(pageId).get('footer');
      var links = model.get('links');
      var footer = AppRouter.view.footer;

      it('renders the custom text', function() {
        //set brandName to appState name to start
        var view_customText = footer.$('#customText').text();
        var model_customText = model.get('customText') || "Powered by Appcubator";
        expect(model_customText).toEqual(view_customText);
      });

      it('updates the custom text', function() {
        var old_customText = model.get('customText') || "Powered by Appcubator";
        model.set('customText', "DERPY");
        var view_customText = footer.$('#customText').text();
        expect("DERPY").toEqual(view_customText);
      });

      it('renders correct number of elements', function() {
        var numLinks = links.length;
        var numListItems = footer.$('#links li').length;
        expect(numLinks).toEqual(numListItems);
      });

      it('adds new links to footer', function() {
        var initialLength = $(footer.el).find('#links li').length;
        links.add({
          title: "DERPTASTIC",
          url: 'http://www.google.com/'
        });
        var after = $(footer.el).find('#links li');
        var finalLength = after.length;
        expect(finalLength).toEqual(initialLength + 1);
        var lastLink = after.last()[0].children[0];
        expect(lastLink.innerHTML).toEqual('DERPTASTIC');
      });

      it('removes links from footer', function() {
        var initialLength = $(footer.el).find('#links li').length;
        links.remove(links.first());
        var finalLength = $(footer.el).find('#links li').length;
        expect(finalLength).toEqual(initialLength - 1);
      });
    });

        // Set up the HTML reporter - this is reponsible for
        // aggregating the results reported by Jasmine as the
        // tests and suites are executed.
        window.consoleReporter = new jasmine.ConsoleReporter();
        var consoleReporter = window.consoleReporter;
        jasmine.getEnv().addReporter(consoleReporter);
        jasmine.getEnv().addReporter(
        new jasmine.HtmlReporter()
        );

        // Run all the loaded test specs.
        jasmine.getEnv().execute();
  });
