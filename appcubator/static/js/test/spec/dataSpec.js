var pageId = 3;
var g_editorView;
var g_appState = {};
var g_initial_appState = {};
var GRID_WIDTH = 80;
var GRID_HEIGHT = 15;

define([
  "models/AppModel",
  "models/UserTableModel",
  "collections/PageCollection",
  "collections/MobilePageCollection",
  "collections/UserRolesCollection",
  "backbone"
],
function( AppModel,
          UserEntityModel,
          PageCollection,
          MobilePageCollection,
          UserRolesCollection) {


  describe( "appState model input-outputs", function () {

    it("UserEntityModel", function () {
      var newUserModel = new UserEntityModel(appState.users[0]);
      expect(appState.users[0]).toEqual(newUserModel.toJSON());
    });

    it("UserRolesCollection", function () {
      var newCollection = new UserRolesCollection(appState.users);
      expect(appState.users).toEqual(newCollection.toJSON());
    });

    it("Whole thing works.", function () {
      var curAppstate = new AppModel(appState);
      curAppstate.set('pages', new PageCollection(appState.pages||[]));
      curAppstate.set('mobilePages', new MobilePageCollection(appState.mobilePages||[]));

      expect(appState).toEqual(curAppstate.toJSON());
    });
  });
});