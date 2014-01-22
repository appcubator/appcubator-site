define(['backbone'], function(Backbone) {
  var UrlModel = Backbone.Model.extend({
    defaults : {
    },

    initialize: function(bone) {
      var urlparts = [];

      if(bone) {
        urlparts = _(bone).map(function(value) {
          return {
            value: value
          };
        });
      }
      this.set('urlparts', new Backbone.Collection(urlparts));
    },

    getAppendixString: function() {
      return this.get('urlparts').pluck('value').join('/');
    },

    getUrlString: function(appSubdomain) {
      return (appUrl||'http://yourapp.com') + this.getAppendixString();
    },

    addUrlPart: function(value) {
      this.get('urlparts').push(value);
    },

    removeUrlPart: function(value) {
      var value = this.get('urlparts').remove(value);
    },

    toJSON: function() {
      var json = this.get('urlparts').pluck('value');
      return json;
    }
  });

  return UrlModel;
});
