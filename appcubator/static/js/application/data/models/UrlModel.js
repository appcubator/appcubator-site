define(['backbone'], function(Backbone) {
  var UrlModel = Backbone.Model.extend({
    defaults : {
      urlparts : []
    },

    getAppendixString: function() {
      return this.get('urlparts').join('/');
    },

    getUrlString: function(appSubdomain) {
      return 'http://' + (appSubdomain||'yourapp.com') + '/' + this.get('page_name') + '/' +  this.getAppendixString();
    },

    addUrlPart: function(value) {
      this.get('urlparts').push(value);
      this.trigger('newUrlPart', value, this.get('urlparts').length-1);
    },

    removeUrlPart: function(index) {
      var value = this.get('urlparts').splice(index, 1);
      this.trigger('removeUrlPart', value, index);
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
