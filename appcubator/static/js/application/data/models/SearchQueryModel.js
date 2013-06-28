define([
],
function() {

  var SearchQueryModel = Backbone.Model.extend({
    initialize: function(bone) {
      var fields =_.map(bone.searchFields, function(field) { console.log(field); return { value: field }; });
      this.set("searchFields", new Backbone.Collection(fields||[]));
    },

    toJSON: function () {
      var json = _.clone(this.attributes);
      console.log(json.searchFields);
      console.log(json.searchFields.pluck('value'));
      json.searchFields = json.searchFields.pluck('value');
      return json;
    }
  });

  return SearchQueryModel;
});
