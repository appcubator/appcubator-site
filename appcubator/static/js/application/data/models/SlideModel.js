define([
"backbone"
],
function() {

  var SlideModel = Backbone.Model.extend({
    initialize: function(bone) {
      if(!bone) bone = {};
      this.set('image', bone.image || "/static/img/placeholder.png");
      this.set('text', bone.text || "Sample text. Double click to start editing."); 
    }
  });

  return SlideModel;
});