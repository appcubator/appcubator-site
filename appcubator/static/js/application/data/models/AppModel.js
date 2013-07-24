define([
  'models/AppInfoModel',
  'collections/UserRolesCollection',
  'collections/TableCollection',
  'collections/PageCollection',
  'collections/MobilePageCollection',
  'collections/EmailCollection'
],
function(AppInfoModel,
         UserRolesCollection,
         TableCollection,
         PageCollection,
         MobilePageCollection,
         EmailCollection) {

  var AppModel = Backbone.Model.extend({

    currentPage: null,
    isMobile: false,
    lazy: {},

    initialize: function(aState) {
      if(!aState) return;

      console.log(aState.info);
      this.set('info', new AppInfoModel(aState.info));
      this.set('users', new UserRolesCollection(aState.users));
      this.set('tables', new TableCollection(aState.tables));
      this.set('emails', new EmailCollection(aState.emails));
    },

    getCurrentPage: function() {
      return this.currentPage;
    },

    getPages: function () {
      if(!this.isMobile) {
        return this.get('pages');
      }
      else {
        return this.get('mobilePages');
      }
    },

    getTableModelWithName: function(nameStr) {
      var tableM = this.get('tables').getTableWithName(nameStr);
      if(!tableM) tableM = this.get('users').getTableWithName(nameStr);
      return tableM;
    },

    getTableModelWithCid: function(cid) {
      var tableM = this.get('tables').get(cid);
      if(!tableM) tableM = this.get('users').get(cid);
      return tableM;
    },

    isSingleUser: function() {
      return this.get('users').length == 1;
    },

    lazySet: function(key, coll) {
      this.lazy[key] = coll;
      this.set(key, new Backbone.Collection([]));
    },

    get: function (key) {
      if(this.lazy[key]) {
        this.set(key, this.lazy[key]);
        delete this.lazy[key];
      }

      return AppModel.__super__.get.call(this, key);
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.info = json.info.toJSON();
      json.users = json.users.toJSON();
      json.tables = json.tables.toJSON();
      json.pages = this.get('pages').toJSON();
      //if(json.mobilePages) json.mobilePages = json.mobilePages.toJSON();
      if(json.mobilePages) json.mobilePages = [];
      json.emails = json.emails.toJSON();

      return json;
    }
  });

  return AppModel;
});
