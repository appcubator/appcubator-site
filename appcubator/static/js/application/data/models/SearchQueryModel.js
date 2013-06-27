define([
],
function() {

  var SearchQueryModel = Backbone.Model.extend({
    initialize: function(bone) {
      console.log(bone);
      this.set("searchFields", new Backbone.Collection(bone.searchFields||[]));
    },

    toJSON: function () {
      var json = _.clone(this.attributes);
      json.searchFields = json.searchFields.toJSON();
      return json;
    }
  });

  return SearchQueryModel;
});

