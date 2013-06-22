define(['backbone'], function(Backbone) {
  var UrlModel = Backbone.Model.extend({
    defaults : {
      urlparts : []
    },

    getAppendixString: function() {
      return '/' + (this.get('urlparts').join('/'));
    },

    getUrlString: function(appSubdomain) {
      return 'http://' + (appSubdomain||'yourapp.com') + '/' +this.get('urlparts').join('/');
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.urlparts = _.filter(json.urlparts, function(val) {
        return val !== "";
      });

      return json;
    }
  });

  return UrlModel;
});