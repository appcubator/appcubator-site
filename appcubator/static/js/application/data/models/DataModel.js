define([
  'models/ContentModel',
  'models/ContainerInfoModel',
  'collections/LoginRouteCollection',
  'models/SearchQueryModel'
],
function(ContentModel,
         ContainerInfoModel,
         LoginRouteCollection,
         SearchQueryModel) {

  var DataModel = Backbone.Model.extend({

    initialize: function(bone, isNew) {
      this.set('content_attribs', new ContentModel(bone.content_attribs||{}));
      if(bone.loginRoutes) { this.set('loginRoutes', new LoginRouteCollection(bone.loginRoutes));}
      if(bone.container_info) {
        this.set('container_info', new ContainerInfoModel(bone.container_info, isNew));
      }
      if(bone.searchQuery) { this.set('searchQuery', new SearchQueryModel(bone.searchQuery)); }
    },

    serialize: function() {
      var json = _.clone(this.attributes);

      if(json.entity) {
        if(_.isString(json.entity)) json.entity = json.entity;
        else if(json.entity.name) json.entity = json.entity.name;
        else json.entity = json.entity.serialize();
      }

      if(json.content_attribs) {
        json.content_attribs = this.get('content_attribs').serialize()||{};
      }

      if(json.container_info) {
        json.container_info = this.get('container_info').serialize();
      }

      if(json.searchQuery) {
        json.searchQuery = this.get('searchQuery').serialize();
      }

      return json;
    }
  });

  return DataModel;
});