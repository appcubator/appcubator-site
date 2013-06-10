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
      this.set('links', new LinkCollection(bone.links));
      this.links = this.get('links');

      _.bindAll(this);
    },

    getLinks: function() {
      return this.get('links');
    },

    //create a duplicate of the first link
    createNewLink: function() {
      var firstLink = this.get('links').models[0].toJSON();
      this.get('links').add(firstLink);
    },

    toJSON : function() {
      var json = _.clone(this.attributes);
      json.links = this.get('links').toJSON();
      return json;
    }

  });

  return NavbarModel;
});
