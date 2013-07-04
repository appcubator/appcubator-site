var pageId = 0;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;
var v1State = {};

define([
  "app/entities/EntitiesView",
  "models/AppModel",
  'models/UserTableModel',
  'models/TableModel',
  "collections/TableCollection",
  "collections/FieldsCollection",
  "editor/KeyDispatcher",
  "editor/MouseDispatcher",
  "comp",
  "backbone",
  "util"
  ],
  function( EntitiesView,
    AppModel,
    UserTableModel,
    TableModel,
    TableCollection,
    FieldsCollection,
    KeyDispatcher,
    MouseDispatcher) {

    util.loadCSS = function(str) { console.log("Tried to load: "+ str); };

    v1State = new Backbone.Model();
    console.log(appState);
    v1State = new AppModel(appState);
    v1State.set('pages', new Backbone.Collection());
    v1State.set('mobilePages', new Backbone.Collection());

    g_guides = {};
    keyDispatcher  = new KeyDispatcher();
    mouseDispatcher  = new MouseDispatcher();

    var AppRouter = {};
    AppRouter.tutorialDirectory = [2];

    if(AppRouter.view) AppRouter.view.remove();
    var cleanDiv = document.createElement('div');
    $('#main-container').append(cleanDiv);
    AppRouter.view = new EntitiesView({});
    AppRouter.view.setElement(cleanDiv).render();
    $('.active').removeClass('active');

    console.log(v1State.toJSON());

    describe('Table', function() {
      it('can load tables and user roles properly', function() {
        var numUsers = v1State.get('users').length;
        var numTableViews = $('#users .entity').length;
        expect(numUsers).toEqual(numTableViews);

        var numTables = v1State.get('tables').length;
        var numTableViews = $('#tables .entity').length;
        expect(numTables).toEqual(numTableViews);
      });

      it("can create a new table view", function() {
        var numTablesBefore = $('#tables .entity').length;
        var newTable = new TableModel({
          name: 'TestTable',
          fields: []
        });
        v1State.get('tables').add(newTable);
        var numTablesAfter = $('#tables .entity-pane').length;
        expect(numTablesAfter).toEqual(numTablesBefore+1);
      });

      it("can remove a user role view", function() {
        var numUsersBefore = $('#users .entity').length;
        var firstUser = v1State.get('users').at(0);
        v1State.get('users').remove(firstUser);
        var numUsersAfter = $('#users .entity-pane').length;
        expect(numUsersAfter).toEqual(numUsersBefore-1);
      });

      it("can remove a table view", function() {
        var numTablesBefore = $('#tables .entity').length;
        var firstTable = v1State.get('tables').at(0);
        v1State.get('tables').remove(firstTable);
        var numTablesAfter = $('#tables .entity-pane').length;
        expect(numTablesAfter).toEqual(numTablesBefore-1);
      });
    });

    describe('User roles', function() {
      var newUserTable = {};
      var tableUIElem = {};
      it('add new button works', function() {
        $('#add-role').trigger('click');
        $('#add-role-form').val('Teacher');

        var e = {};
        e.keyCode = 13;
        e.target = document.getElementById('add-role-form');
        e.preventDefault = function() {};

        var numTablesBefore = $('#users .entity').length;
        newUserTable = AppRouter.view.createUserRole(e);
        var numTablesAfter = $('#users .entity').length;

        expect(newUserTable).not.toEqual(null);
        expect(numTablesAfter).toEqual(numTablesBefore+1);
      });

      it("the name is rendered correctly", function() {
        var uielem = document.getElementById('user-table-'+ newUserTable.cid);
        expect(uielem).not.toEqual(null);
        var title = $(uielem).find('h2').text();
        expect(title).toEqual("Teacher");
      });

      it("the name is rendered correctly", function() {
        var uielem = document.getElementById('user-table-'+ newUserTable.cid);
        tableUIElem = uielem;
        expect(uielem).not.toEqual(null);
        var title = $(uielem).find('h2').text();
        expect(title).toEqual("Teacher");
      });

      it("can add text field", function() {
        $(tableUIElem).find('.add-property-button').trigger('click');
        $(tableUIElem).find('.property-name-input').val('Address');
        $(tableUIElem).find('.add-property-form').submit();
        var model = newUserTable.get('fields').last();
        expect(model.get('name')).toEqual('Address');
        expect(model.get('type')).toEqual('text');
      });

    });
});
