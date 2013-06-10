define([
	'collections/LinkCollection'
],
function(LinkCollection) {

  var FooterModel = Backbone.Model.extend({

    defaults : {
      customText : "Add custom footer text here",
      isHidden : false,
      isFixed : true
    },

    initialize: function(bone) {

      //init items collection with links passed from appState
      this.set('links', new LinkCollection(bone.links||[]));
      this.links = this.get('links');
      _.bindAll(this);
    },

    getLinks: function() {
      return this.get('links');
    },

    //create a duplicate of the first link
    createNewLink: function() {
      var firstLink = this.models[0].toJSON();
      this.push(firstLink);
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.links = json.links.toJSON();
      return json;
    }
  });

  return FooterModel;
});
