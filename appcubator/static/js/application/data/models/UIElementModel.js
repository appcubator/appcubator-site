define(['backbone'], function() {
  var UIElementModel = Backbone.Model.extend({
    initialize: function(bone) {

      this.set('style', bone.style||'');
      this.set('hoverStyle', bone.hoverStyle||'');
      this.set('activeStyle', bone.activeStyle||'');

    }
  });

  return UIElementModel;
});