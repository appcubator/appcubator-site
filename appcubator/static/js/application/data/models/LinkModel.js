define(['backbone'],
function(Backbone) {
  var LinkModel = Backbone.Model.extend({
    defaults : {
      title: 'URL Title',
      url: ''
    }
  });

  return LinkModel;
});
