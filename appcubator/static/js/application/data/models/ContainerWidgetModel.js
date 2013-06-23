define([
  'models/WidgetModel'
],
function(WidgetModel) {

  var ContainerWidgetModel = WidgetModel.extend({

    initialize: function(bone, isNew) {
      ContainerWidgetModel.__super__.initialize.call(this, bone, isNew);
    },

    getLoginRoutes: function() {
      var loginRoutes;

      if(this.model.get('data').get('container_info').has('form')) {
        loginRoutes = this.model.get('data').get('container_info').get('form').get('loginRoutes');
      }
      else {
        loginRoutes =this.model.get('data').get('loginRoutes');
      }

      return loginRoutes;
    },

    toJSON : function() {
      var json = _.clone(this.attributes);

      json.layout = this.get('layout').toJSON();
      json.data   = this.get('data').toJSON();

      return json;
    }
  });

  return ContainerWidgetModel;
});
