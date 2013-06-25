define([
"backbone"
],
function() {

  var AppInfoModel = Backbone.Model.extend({
    initialize: function(bone) {
      this.set("name", bone.name||"AppcubatorApp");
      this.set("description", bone.description||"");
      this.set("keywords", bone.keywords||"");
    }
  });

  return AppInfoModel;
});