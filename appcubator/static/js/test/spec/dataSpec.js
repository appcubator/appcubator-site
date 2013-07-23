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
  "collections/TableCollection",
  "collections/EmailCollection",
  "models/AppInfoModel",
  "backbone",
  "mixins/BackboneConvenience"
],
function( AppModel,
          UserTableModel,
          PageCollection,
          MobilePageCollection,
          UserRolesCollection,
          TableCollection,
          EmailCollection,
          AppInfoModel) {

  describe("Emails", function() {
    it("works", function() {
      var emailsCollection = new EmailCollection(appState.emails);
      expect(appState.emails).toEqual(emailsCollection.toJSON());
    });
  });

  describe("Info", function() {
    it("works", function() {
      var infoModel = new AppInfoModel(appState.info);
      expect(appState.info).toEqual(infoModel.toJSON());
    });
  });

  describe("Mobile Pages", function() {
    it("works", function() {
      var pagesCollection = new MobilePageCollection(appState.mobilePages);
      expect(appState.mobilePages).toEqual(pagesCollection.toJSON());
    });
  });

  describe("Pages", function() {
    it("works", function() {
      //var pagesCollection = new PageCollection(appState.pages);
      //expect(appState.pages).toEqual(pagesCollection.toJSON());
    });
  });

  describe("User Tables", function() {
    it("works", function() {
      var usersCollection = new UserRolesCollection(appState.users);
      expect(appState.users).toEqual(usersCollection.toJSON());
    });
  });

  describe("Tables", function() {
      var tablesCollection = new TableCollection(appState.tables);
      expect(appState.tables).toEqual(tablesCollection.toJSON());
  });

});