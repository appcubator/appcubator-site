define([
"backbone"
],
function() {

  var ActionModel = Backbone.Model.extend({
    initialize: function(bone) {
      this.set("type", bone.type);
    },

    getNL: function() {
      if(this.get('type') == "redirect") {
        return "Go to " + this.get('page_name');
      }

      if(this.get('type') == "relation") {
        if(this.get('nl_description')) return this.get('nl_description');
      }

      if(this.get('type') == "email") {
        if(this.get('nl_description')) return this.get('nl_description');
      }

      return this.get('type');
    },

    serialize: function () {
      var json = _.clone(this.attributes);
      if(json.type == "goto") {
        var str = "internal://" + json.page_name;
        if(json.context) str += "/?" + json.context;
        return str;
      }
      return json;
    }
  });

  return ActionModel;
});

