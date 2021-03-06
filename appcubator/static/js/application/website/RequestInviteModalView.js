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
      this.ajaxify();
    },

    render: function() {
      var self = this;
      var temp = document.getElementById('temp-inviteform').innerHTML;
      this.el.innerHTML = _.template(temp, {});

      $('input[type=checkbox]').prettyCheckable();
      // $('input[type=radio]').prettyCheckable();

      return this;
    },

    ajaxify: function() {
      var self = this;
      this.$el.find('#sign-up-form').on('submit', function(e) {
        e.preventDefault();

        obj = {};
        obj.name = $("#inp-name").val();
        obj.email = $("#inp-email").val();
        obj.company = $("#inp-company").val();
        obj.extra = $("#inp-extra").val();
        obj.interest = $('#inp-interest').prop('checked');
        obj.description = $('#inp-description').val();

        var isFilled = true;

        for (var key in obj) {
          var val = obj[key];
          if(val === "") {
            isFilled = false;
            $("#inp-" + key).addClass('required-border');
          }
          else {
            $("#inp-" + key).removeClass('required-border');
          }
        }

        if(isFilled) {
         $.ajax({
          url: "/signup_form/",
          type: "POST",
          data: obj,
          dataType: "JSON"
        });

         self.$el.find('#sign-up-form').hide();
         self.$el.find('.thanks-for-signing').fadeIn();
         self.showTweetBtn();
       }
     });
    },
    showTweetBtn: function() {
      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
    }

  });

return SignupModalView;
});
