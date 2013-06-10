define([
  'models/WidgetModel'
],
function(WidgetModel) {

  var ContainerWidgetModel = WidgetModel.extend({
    defaults: {
      'container_info' : null
    },

    initialize: function(bone, isNew) {
      ContainerWidgetModel.__super__.initialize.call(this, bone, isNew);
    },

    toJSON : function() {
      var json = _.clone(this.attributes);

      json.type   = "form";
      json.layout = this.get('layout').toJSON();
      json.data   = this.get('data').toJSON();

      return json;
    }
  });

  return ContainerWidgetModel;
});
