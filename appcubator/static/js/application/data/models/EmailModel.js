define([
  'backbone'
],
function() {

  var EmailModel = Backbone.Model.extend({
    defaults : {
		"name"      : "New Email",
		"subject"   : "New Subject",
		"content"   : "Hello. Hello."
    }
  });

  return EmailModel;
});
