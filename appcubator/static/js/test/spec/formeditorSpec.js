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
  "backbone",
  "mixins/BackboneConvenience"
  ],
  function( EditorView,
    AppModel,
    UserEntityModel,
    PageCollection,
    MobilePageCollection,
    UserRolesCollection,
    KeyDispatcher,
    MouseDispatcher) {

    util.loadCSS = function(str) {  };

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

      it("has a form editor", function() {
        $('.form-editor-btn').trigger('click');
        expect($('.modal.form-editor').length>0).toBe(true);
      });

      it("adds new fields", function() {

        var form = model.getForm();
        var entity = model.get('data').get('container_info').get('entity');

        var nmrOfFields = form.get('fields').length;
        $('.add-field-button').trigger('click');

        $('.new-field-option').first().trigger('click');
        $('.new-field-option').first().trigger('click');

        var newNmrOfFields = form.get('fields').length;
        expect(newNmrOfFields).toBe(nmrOfFields + 1);
      });

      it("types of the model fields corresponds to form fields", function() {
        var form = model.getForm();
        var entity = model.get('data').get('container_info').get('entity');

        var hasSubmitBtn = false;
        form.get('fields').each(function(formField) {
          if(formField.get('type') == "button") { hasSubmitBtn = true; return;}
          var hasMatch = false;
          entity.get('fields').each(function(field) {
            if(field.get('name') == formField.get('field_name')) hasMatch = true;
          });
          expect(hasMatch).toBe(true);
        });

        expect(hasSubmitBtn).toBe(true);
      });

      it("required yes, sets required to yes", function() {
        var form = model.getForm();
        $('.field-li-item').first().trigger('click');
        $('#required[value="yes"]').trigger('click');
        expect(form.get('fields').first().get('required')).toBe(true);
      });

      it("required no, sets required to no", function() {
        var form = model.getForm();
        $('#not-required[value="no"]').trigger('click');
        expect(form.get('fields').first().get('required')).toBe(false);
      });

      it("placeholder should alter the placeholder", function() {
        var form = model.getForm();

        $('.field-placeholder-input').val('Ma New Placeholder');
        $('.field-placeholder-input').trigger('keyup');

        var cid = form.get('fields').first().cid;
        var newText = $('#field-' + cid).find('input[type="text"]').attr('placeholder');

        expect(newText).toEqual('Ma New Placeholder');
      });

      it("label should alter the label", function() {
        var form = model.getForm();

        $('.field-label-input').val('Ma New Label');
        $('.field-label-input').trigger('keyup');

        var cid = form.get('fields').first().cid;
        var newText = $('#field-' + cid).find('label.header').text();

        expect(newText).toEqual('Ma New Label');
      });

      it("it should remove form fields", function() {

        var form = model.getForm();
        var entity = model.get('data').get('container_info').get('entity');
        var cid = form.get('fields').first().cid;


        var nmrOfFields = form.get('fields').length;

        $('#delete-btn-field-'+cid).trigger('click');

        var newNmrOfFields = form.get('fields').length;
        expect(newNmrOfFields).toBe(nmrOfFields - 1);

      });

      it("it should add new model fields", function() {
        var form = model.getForm();
        var entity = model.get('data').get('container_info').get('entity');

        var nmrOfFields = form.get('fields').length;
        var nmrOfEntityFields = entity.get('fields').length;

        $('.add-field-button').trigger('click');

        $('#tablefield-new').trigger('click');
        $('#tablefield-new').trigger('click');

        $('.new-field-name').val('AwesomeContent');
        $('input[value="image"]').trigger('click');
        $('.new-field-form').submit();

        var newNmrOfFields = form.get('fields').length;
        var newNmrOfEntityFields = entity.get('fields').length;

        expect(newNmrOfFields).toBe(nmrOfFields + 1);
        expect(newNmrOfEntityFields).toBe(nmrOfEntityFields + 1);

      });

      it("options splits the comma properly", function() {
        var form = model.getForm();

        $('.field-li-item').first().trigger('click');

        $('input[value="dropdown"]').first().trigger('click');
        $('input[value="dropdown"]').first().trigger('click');

        expect($('.options-input').length).toBe(1);

        $('.options-input').val('Cars,Birds,PG,And Stuff, ----YO');
        $('.options-input').trigger('keyup');

        var cid = form.get('fields').first().cid;
        var nmrOfOptions = $('#field-' + cid).find('select.dropdown').find('option').length;

        expect(nmrOfOptions).toEqual(5);
      });

      it("image should have a button", function() {
        var form = model.getForm();
        var entity = model.get('data').get('container_info').get('entity');

        $('.add-field-button').trigger('click');

        $('#tablefield-new').trigger('click');
        $('#tablefield-new').trigger('click');

        $('.new-field-name').val('AwesomeContent');
        $('input[value="image"]').trigger('click');
        $('.new-field-form').submit();

        var nmrOfFields = form.get('fields').length;
        var nmrOfEntityFields = entity.get('fields').length;

        var cid = form.get('fields').models[nmrOfFields-2].cid;

        expect($('#field-'+cid).find('.upload-image.btn').length).toBe(1);
      });

      it("file should have a button", function() {
        var form = model.getForm();
        var entity = model.get('data').get('container_info').get('entity');

        $('.add-field-button').trigger('click');

        $('#tablefield-new').trigger('click');
        $('#tablefield-new').trigger('click');

        $('.new-field-name').val('AwesomeContent');
        $('input[value="file"]').trigger('click');
        $('.new-field-form').submit();

        var nmrOfFields = form.get('fields').length;
        var nmrOfEntityFields = entity.get('fields').length;

        var cid = form.get('fields').models[nmrOfFields-2].cid;

        expect($('#field-'+cid).find('.upload-file.btn').length).toBe(1);

      });

      it("should have a default goto to current page", function() {
        var form = model.getForm();
        var formPage = form.get('goto').get('page_name');
        var currentPage = v1State.getCurrentPage().get('name');

        expect(formPage).toBe(currentPage);
        var text = $('.current-actions').find('li.goto-action').text();
        expect(text).toEqual('Go to ' + currentPage);
      });

      it("should have list of go-tos for all pages", function() {
        var nmr = $('.goto-list').find('li').length;
        var nmrPages = v1State.get('pages').length;
        expect(nmr).toEqual(nmrPages - 2);
      });


      it("datalang should be valid for each page", function() {
        //throw "fail";
      });

      it("number of add to should be equal to number of fks in the model", function() {
       // throw "fail";
      });

      it("number of email options should be equal to number of emails", function() {
        var nmr = $('.email-list').find('li').length;
        var nmrPages = v1State.get('emails').length;
        expect(nmr).toEqual(nmrPages);
      });

      it("should re-order properly", function() {
        //throw "fail";
      });

      it("has a submit button at the bottom", function() {

        var form = model.getForm();
        var cid = form.get('fields').last().cid;
        var nmrOfOptions = $('#field-' + cid).find('.btn').length;

        expect(nmrOfOptions).toEqual(1);
        expect(form.get('fields').last().get('type')).toBe('button');

      });

      it("can be deleted", function() {
        $('.modal-cross').trigger('click');
        validateDeleteable(model);
      });

    });

  });
