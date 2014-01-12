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
      
      if(appState) {
        try {
          if(appState.pages[0].navbar.version == 2) {
            this.set('version', 2);
          }
        }
        catch(err) {
          console.log("Problem with accessing first page.");
        }
      }
      
    },

    getLinks: function() {
      return this.get('links');
    },

    serialize : function() {
      var json = _.clone(this.attributes);
      json.links = this.get('links').serialize();
      return json;
    }

  });

  return NavbarModel;
});
