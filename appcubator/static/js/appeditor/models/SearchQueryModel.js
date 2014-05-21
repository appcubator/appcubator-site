define([
  "backbone"
],
function() {

  var SearchQueryModel = Backbone.Model.extend({
    initialize: function(bone) {
      var fields =_.map(bone.searchFields, function(field) { return { value: field }; });
      this.set("searchFields", new Backbone.Collection(fields||[]));
      this.listenTo(v1State.getTableModelWithName(bone.searchOn).get('fields'), 'remove', this.entityFieldRemoved);
    },

    removeFieldWithName: function(nameStr) {
      this.get('searchFields').each(function(searchField) {
        if(searchField.get('value') == nameStr) this.get('searchFields').remove(searchField);
      }, this);
    },

    entityFieldRemoved: function(fieldModel) {
      var name = fieldModel.get('name');
      var searchFieldModel = this.get('searchFields').find(function(sModel) {
        return sModel.get('value') == name;
      });
      this.get('searchFields').remove(searchFieldModel);
    },

    fillWithFields: function(entity) {
      entity.get('fields').each(function (fieldM) {
        if(fieldM.isRelatedField()) return;
        this.get('searchFields').push({ value: fieldM.get('name')});
      }, this);
    },

    serialize: function () {
      var json = _.clone(this.attributes);
      json.searchFields = json.searchFields.pluck('value');
      return json;
    }
  });

  return SearchQueryModel;
});
