define([
  'mixins/BackboneModal'
],
function(BackboneModal) {
  var SignupModalView = Backbone.ModalView.extend({
    padding: 0,
    width: 660,
    className: 'model fancy signup',

    //height: 150,
    events: {
      // 'submit form'           : 'onFormSubmit'
    },

    initialize: function(urlModel){
      _.bindAll(this);
      this.render();
    },

    render: function() {
      var self = this;
      var temp = document.getElementById('temp-signupform').innerHTML;
      this.el.innerHTML = _.template(temp, {});

      $('input[type=checkbox]').prettyCheckable();
      // $('input[type=radio]').prettyCheckable();

      return this;
    }

  });

  return SignupModalView;
});
