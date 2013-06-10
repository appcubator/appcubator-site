define([
  'models/LinkModel'
],
function(LinkModel) {

  var LinkCollection = Backbone.Collection.extend({
    model: LinkModel
  });

  return LinkCollection;
});
