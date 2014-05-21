define([
  'backbone'
],
function() {

  var LoginRouteCollection = Backbone.Collection.extend({

    initialize: function() {
      v1State.get('users').bind('change add remove', this.reorganize, this);
    },

    findRouteWithRole: function(roleStr) {
      var val = null;
      this.each(function(userRole) {
        if(userRole.get('role') == roleStr) {
          val = userRole.get('redirect');
          return val;
        }
      }, this);
      return "internal://Homepage";
    },

    reorganize: function() {
      var newContent = [];
      v1State.get('users').each(function(user) {
        var val = this.findRouteWithRole(user.get('name'));
        newContent.push({
          role: user.get('name'),
          redirect: val
        });
      }, this);

      this.reset(newContent);
    }

  });

  return LoginRouteCollection;
});
