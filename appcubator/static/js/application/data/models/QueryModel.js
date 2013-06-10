define(['backbone'], function() {

  var QueryModel = Backbone.Model.extend({

    initialize: function(bone, entityModel) {
      this.entity = entityModel;
      this.set('fieldsToDisplay', bone.fieldsToDisplay||[]);
      this.set('belongsToUser', bone.belongsToUser||false);
      this.set('sortAccordingTo', bone.sortAccordingTo||"Date");
      this.set('numberOfRows', bone.numberOfRows||-1);
    }

  });

  return QueryModel;
});