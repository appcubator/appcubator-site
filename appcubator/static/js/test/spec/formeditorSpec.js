var pageId = 0;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;
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
  "comp",
  "backbone"
  ],
  function( EditorView,
    AppModel,
    UserEntityModel,
    PageCollection,
    MobilePageCollection,
    UserRolesCollection,
    KeyDispatcher,
    MouseDispatcher) {

    util.loadCSS = function(str) { console.log("Tried to load: "+ str); };

    v1State = new Backbone.Model();
    v1State = new AppModel(appState);
    v1State.set('pages', new PageCollection(appState.pages||[]));
    v1State.set('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

    g_guides = {};
    keyDispatcher  = new KeyDispatcher();
    mouseDispatcher  = new MouseDispatcher();

    var AppRouter = {};
    $('.page').fadeOut();
    AppRouter.tutorialDirectory = [5];

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
      getValidation(v1State.toJSON(), callback);
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
      var className = "login authentication ui-draggable";
      var loginForm = document.getElementById(id);
      var model;

      it("is on gallery.", function () {
        expect(loginForm).not.toBe(null);
      });

      it("can be dropped to the editor", function() {
        /* Drop the element */
        var fE = _.clone(fEvent);
        fE.target = loginForm;
        //fE.target.className = className;
        //fE.target.id = id;

        /* Check if exists */
        model = AppRouter.view.galleryEditor.dropped(fE, fUi);
        var droppedEl = document.getElementById('widget-wrapper-' + model.cid);
        expect(droppedEl).not.toBe(null);
      });

      it("can be edited", function() {
        $('.edit-login-form-btn').trigger('click');
        expect($('.login-route-editor').length>0).toBe(true);
        $('.modal-cross').trigger('click');
      });

      it("is valid on the backend", function() {
        /* Check validation */
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Sign Up Form", function () {

      var id = "entity-user-User";
      var className = "signup authentication ui-draggable";
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

      it("can be edited", function() {
        $('.form-editor-btn').trigger('click');
        expect($('.form-editor').length>0).toBe(true);
        $('.modal-cross').trigger('click');
      });

      it("is valid on the backend", function() {
        /* Check validation */
        validateBackend();
      });

      it("can be deleted", function() {
        validateDeleteable(model);
      });

    });

    describe("Facebook Login Form", function () {
      var id = "entity-user-facebook";
      var className = "facebook thirdparty authentication ui-draggable";
      var galleryElement = document.getElementById(id);

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

      it("can be edited", function() {
        $('.edit-login-form-btn').trigger('click');
        expect($('.login-route-editor').length>0).toBe(true);
        $('.modal-cross').trigger('click');
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
      var className = "twitter thirdparty authentication ui-draggable";
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

      it("can be edited", function() {
        $('.edit-login-form-btn').trigger('click');
        expect($('.login-route-editor').length>0).toBe(true);
        $('.modal-cross').trigger('click');
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
      var className = "linkedin thirdparty authentication ui-draggable";
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

      it("can be edited", function() {
        $('.edit-login-form-btn').trigger('click');
        expect($('.login-route-editor').length>0).toBe(true);
        $('.modal-cross').trigger('click');
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
  });
