define([
  'models/AppInfoModel',
  'collections/UserRolesCollection',
  'collections/TableCollection',
  'collections/EmailCollection',
  'collections/TemplateCollection',
  'collections/PluginCollection',
  'models/EntityManager'
],
function(AppInfoModel,
         UserRolesCollection,
         TableCollection,
         EmailCollection,
         TemplateCollection,
         PluginCollection,
         EntityManager) {

  var AppModel = Backbone.Model.extend({

    currentPage: null,
    isMobile: false,
    lazy: {},

    initialize: function(aState) {
      if(!aState) return;

      this.set('info', new AppInfoModel(aState.info));
      this.set('users', new UserRolesCollection(aState.users));
      this.set('tables', new TableCollection(aState.models));
      this.set('emails', new EmailCollection(aState.emails));
      this.set('templates', new TemplateCollection(aState.templates));
      this.set('generators', new PluginCollection(aState.generators));
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

    getWidgetsRelatedToTable: function(tableM) {
      return new EntityManager({ pages: this.get('pages') }).getWidgetsRelatedToTable(tableM);
    },

    getWidgetsRelatedToPage: function(pageM) {
      return new EntityManager({ pages: this.get('pages') }).getWidgetsRelatedToPage(pageM);
    },

    getNavLinkRelatedToPage: function(pageM) {
      return new EntityManager({ pages: this.get('pages') }).getLinksRelatedToPage(pageM);
    },

    getWidgetsRelatedToField: function(fieldM) {
      return new EntityManager({ pages: this.get('pages') }).getWidgetsRelatedToField(fieldM);
    },

    serialize: function() {
      var json = _.clone(this.attributes);
      json.info = json.info.serialize();
      json.users = json.users.serialize();
      json.tables = json.tables.serialize();
      //if(json.mobilePages) json.mobilePages = json.mobilePages.serialize();
      json.emails = json.emails.serialize();
      json.templates = json.templates.serialize();
      json.routes = json.routes.serialize();

      return json;
    }
  });

  return AppModel;
});
