define([
  'mixins/BackboneModal'
  ],
  function(BackboneModal) {
    var SignupModalView = Backbone.ModalView.extend({
      padding: 0,
      width: 630,
      className: 'model fancy signup',

    //height: 150,
    events: {
      // 'submit form'           : 'onFormSubmit'
    },

    initialize: function(){
      _.bindAll(this);
      this.render();
      this.ajaxify();
    },

    render: function() {
      var self = this;
      var temp = document.getElementById('temp-signupform').innerHTML;
      this.el.innerHTML = _.template(temp, {});

      $('input[type=checkbox]').prettyCheckable();
      $('input[type=radio]').prettyCheckable();

      $('#other-input').on('focus', function() { $('input[value="other"]').attr('checked', true); });
      this.bindFBBtn();
      return this;
    },

    ajaxify: function() {
      var self = this;
      this.$el.find('#signup').on('submit', function(e) {
        e.preventDefault();

        $('#sign-up').hide();
        $('#passive-button').show();
        $('#passive-button').append(util.threeDots().el);

        var self = this;
        url = $(e.currentTarget).attr('action');
        obj = {};
        obj.name = $("#inp-name").val();
        obj.email = $("#inp-email").val();
        obj.password1 = $("#inp-pwd1").val();
        obj.password2 = $("#inp-pwd2").val();

        obj.description = $("input[name=description]:checked").val();
        if(obj.description == "other") { obj.description = $('#other-input').val(); }

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
          url: url,
          type: "POST",
          data: obj,
          dataType: "JSON",
          success: function(data, statusStr, xhr) {
            
            $('#passive-button').hide();
            $('#sign-up').show();

            if (typeof(data.redirect_to) !== 'undefined') {
              location.href = data.redirect_to;
            } else {
              _.each(data, function(val, key, ind) {
                if(key==='__all__') {
                  $(self).find('.form-error.field-all').html(val.join('<br />'));
                } else {
                  $(self).find('.form-error.field-name-'+key).html(val.join('<br />'));
                }
              });
            }
          },
          complete: function() {
            $('#sign-up').show();
            $('#passive-button').hide();
          }
        });

         //self.showTweetBtn();
       }
       else {
            $('#passive-button').hide();
            $('#sign-up').show();
       }
     });
    },

    bindFBBtn: function() {
      $('.btn-facebook').on('click', function() {
            FB.login(function(response) {
             if (response.authResponse) {
              FB.api('/me', function(response) {
                $("#inp-name").val(response.name);
                $("#inp-email").val(response.email);
                $("#inp-extra").val(JSON.stringify(response));
               });
             } else {
               console.log('User cancelled login or did not fully authorize.');
             }
           }, {scope: 'email'});
      });
    },

    showTweetBtn: function() {
      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
    }

  });

return SignupModalView;
});
