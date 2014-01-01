define([
  'collections/WhereCollection',
  'backbone'
], function(WhereCollection) {

  var TableCodeModel = Backbone.Model.extend({

    initialize: function(bone, entityModel) {
      this.set('code', bone.code||"");
      this.set('name', bone.name||"default");
    }

  });

  return TableCodeModel;
});