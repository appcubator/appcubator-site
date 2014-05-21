define(['backbone'],
function(Backbone) {
  var LinkModel = Backbone.Model.extend({
    defaults : {
      title: 'Homepage',
      url: 'internal://Homepage'
    }
  });

  return LinkModel;
});
