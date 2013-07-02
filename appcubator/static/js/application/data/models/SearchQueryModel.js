define([
],
function() {

  var SearchQueryModel = Backbone.Model.extend({
    initialize: function(bone) {
      var fields =_.map(bone.searchFields, function(field) { console.log(field); return { value: field }; });
      this.set("searchFields", new Backbone.Collection(fields||[]));
    },

    removeFieldWithName: function(nameStr) {
      this.get('searchFields').each(function(searchField) {
        if(searchField.get('value') == nameStr) this.get('searchFields').remove(searchField);
      }, this);
    },

    toJSON: function () {
      var json = _.clone(this.attributes);
      json.searchFields = json.searchFields.pluck('value');
      return json;
    }
  });

  return SearchQueryModel;
});
