define([
	'collections/LinkCollection'
],
function(LinkCollection) {

  var FooterModel = Backbone.Model.extend({

    defaults : {
      customText : "Powered by Appcubator",
      isHidden : false,
      isFixed : true
    },

    initialize: function(bone) {

      //init items collection with links passed from appState
      this.set('links', new LinkCollection(bone.links||[]));
      this.links = this.get('links');

    },

    getLinks: function() {
      return this.get('links');
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.links = json.links.toJSON();
      return json;
    }
  });

  return FooterModel;
});
