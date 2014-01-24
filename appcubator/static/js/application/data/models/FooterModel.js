define([
	'collections/LinkCollection'
],
function(LinkCollection) {

  var FooterModel = Backbone.Model.extend({

    defaults : {
      customText: "Copyright 2014",
      isHidden  : false,
      isFixed   : true
    },

    initialize: function(bone) {

      this.setGenerator("templates.footer");
      //init items collection with links passed from appState
      this.set('links', new LinkCollection(bone.links||[ {
        title: "Powered by Appcubator",
        url:   "http://appcubator.com" }
      ]));

      this.links = this.get('links');
    },

    getLinks: function() {
      return this.get('links');
    },

    toJSON: function() {
      var json = _.clone(this.attributes);
      json.links = json.links.serialize();
      return json;
    }
  });

  return FooterModel;
});
