define(['backbone'], function(Backbone) {
  var ContentModel = Backbone.Model.extend({

    initialize: function(bone) {
      if(bone.src && util.isInternalData(bone.src)) {
        console.log("YO");
        this.set('src_content', _.clone(bone.src));
        this.set('src', "/static/img/placeholder.png");
      }
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      if(json.content_attribs && json.content_attribs.src_content) {
        console.log("HEY");
        json.content_attribs.src = json.content_attribs.src_content;
      }
      return json;
    }

  });
  return ContentModel;
});