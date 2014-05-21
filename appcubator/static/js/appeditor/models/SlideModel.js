define([
"backbone"
],
function() {

  var SlideModel = Backbone.Model.extend({
    initialize: function(bone) {
      if(!bone) bone = {};
      this.set('image', bone.image || "http://placehold.it/150x150");
      this.set('text', bone.text || "Sample text. Double click to start editing.");
    }
  });

  return SlideModel;
});
