define([
  'backbone'
],
function() {

  var FormFieldModel = Backbone.Model.extend({
    initialize: function(bone) {
      this.set('name', bone.name);
      this.set('displayType', bone.displayType);
      if(bone.type) { this.set('type', bone.type); }
      this.set('label', (bone.label||bone.name));
      this.set('placeholder', (bone.placeholder||bone.name));
      this.set('required', (bone.required || false));
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      if(json.displayType == "button") { json = _.omit(json, 'options'); }
      return json;
    }
  });

  return FormFieldModel;

});
