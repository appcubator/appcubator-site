define([
  'backbone',
  'models/EmailModel'
],
function(Backbone,
         EmailModel) {

  var EmailCollection = Backbone.Collection.extend({
    model: EmailModel,

    getEmailWithName: function(emailNameStr) {
      var email = this.where({name : emailNameStr })[0];
      return email;
    }
  });

  return EmailCollection;
});