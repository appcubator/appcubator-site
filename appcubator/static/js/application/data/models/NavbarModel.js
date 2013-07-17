define([
  'collections/LinkCollection'
],
function(LinkCollection) {

  var NavbarModel = Backbone.Model.extend({
    defaults : {
      brandName : null,
      isHidden : false,
      isFixed : true
    },
    initialize: function(bone) {

      //init items collection with links passed from appState
      this.set('links', new LinkCollection(bone.links||[]));
    },

    getLinks: function() {
      return this.get('links');
    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json.links = this.get('links').toJSON();
      return json;
    }

  });

  return NavbarModel;
});
