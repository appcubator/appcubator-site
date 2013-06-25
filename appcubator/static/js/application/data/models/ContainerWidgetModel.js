define([
  'models/WidgetModel',
  'collections/LoginRouteCollection'
],
function( WidgetModel,
          LoginRouteCollection) {

  var ContainerWidgetModel = WidgetModel.extend({

    initialize: function(bone, isNew) {
      ContainerWidgetModel.__super__.initialize.call(this, bone, isNew);
    },

    createLoginRoutes: function() {
      this.get('data').set('loginRoutes', new LoginRouteCollection());
      v1State.get('users').each(function(userModel) {
        this.get('data').get('loginRoutes').push({
          role: userModel.get('name'),
          redirect: "internal://Homepage"
        });
      }, this);
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
