define([
  'models/ContentModel',
  'models/ContainerInfoModel'
],
function(ContentModel,
         ContainerInfoModel) {

  var DataModel = Backbone.Model.extend({

    initialize: function(bone, isNew) {
      this.set('content_attribs', new ContentModel(bone.content_attribs||{}));
      if(bone.container_info) {
        this.set('container_info', new ContainerInfoModel(bone.container_info, isNew));
      }
      else {
        this.set('container_info', new ContainerInfoModel({},false));
      }
    },

    toJSON: function() {
      var json = _.clone(this.attributes);

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