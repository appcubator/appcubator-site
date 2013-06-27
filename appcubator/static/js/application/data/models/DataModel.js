define([
  'models/ContentModel',
  'models/ContainerInfoModel',
  'models/SearchQueryModel',
  'collections/LoginRouteCollection'
],
function(ContentModel,
         ContainerInfoModel,
         SearchQueryModel,
         LoginRouteCollection) {

  var DataModel = Backbone.Model.extend({

    initialize: function(bone, isNew) {
      this.set('content_attribs', new ContentModel(bone.content_attribs||{}));
      if(bone.loginRoutes) { this.set('loginRoutes', new LoginRouteCollection(bone.loginRoutes));}
      if(bone.searchQuery) { this.set('searchQuery', new SearchQueryModel(bone.searchQuery)); }
      if(bone.container_info) {
        this.set('container_info', new ContainerInfoModel(bone.container_info, isNew));
      }
    },

    toJSON: function() {
      var json = _.clone(this.attributes);

      if(json.entity) {
        if(_.isString(json.entity)) json.entity = json.entity;
        else if(json.entity.name) json.entity = json.entity.name;
        else json.entity = json.entity.toJSON();
      }
      if(json.content_attribs) {
        json.content_attribs = this.get('content_attribs').toJSON()||{};
      }

      if(json.container_info) {
        json.container_info = this.get('container_info').toJSON();
      }
      return json;
    }
  });

  return DataModel;
});