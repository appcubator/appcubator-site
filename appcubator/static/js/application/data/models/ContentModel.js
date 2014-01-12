define(['backbone'], function(Backbone) {
  var ContentModel = Backbone.Model.extend({

    initialize: function(bone) {
      if(bone.src && util.isInternalData(bone.src)) {
        this.set('src_content', _.clone(bone.src));
        this.set('src', "/static/img/placeholder.png");
      }
    },

    serialize: function() {
      var json = _.clone(this.attributes);
      if(json.src_content) {
        json.src = json.src_content;
      }
      delete json.src_content;
      return json;
    }

  });
  return ContentModel;
});