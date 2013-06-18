define([
  'collections/WhereCollection',
  'backbone'
], function(WhereCollection) {

  var QueryModel = Backbone.Model.extend({

    initialize: function(bone, entityModel) {
      this.entity = entityModel;
      this.set('fieldsToDisplay', bone.fieldsToDisplay||[]);
      this.set('sortAccordingTo', bone.sortAccordingTo||"Date");
      this.set('numberOfRows', bone.numberOfRows||-1);
      this.set('where', new WhereCollection(bone.where||[]));
    },

    toJSON: function () {
      var json = _.clone(this.attributes);
      json.where = json.where.toJSON();

      return json;
    }

  });

  return QueryModel;
});