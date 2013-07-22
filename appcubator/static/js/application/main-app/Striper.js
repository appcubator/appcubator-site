define([
  'jquery',
  'https://checkout.stripe.com/v2/checkout.js'
],
  function() {

    var Striper = Backbone.View.extend({

      initialize: function() {
        _.bindAll(this);
      },

      render: function() {
        return this;
      },

      bindPayment: function(selector, formId) {
        var self = this;
        $(selector).on('click', {tokem: this.token, formId: formId}, this.checkoutOpen);
      },

      checkoutOpen: function(e) {
          StripeCheckout.open({
            key       :   $('#' + event.data.formId).data("stripe-key"),
            name      :  'Payment Method',
            panelLabel:  'Add Payment Method',
            token     :   event.data.token
          });
      },

      token: function(result) {
        $form.find("input[name=stripe_token]").val(res.id);
        $.ajax({
             type: 'POST',
             url: '/payments/a/subscribe/',
             data: $form.serialize(),
             success: function(data, statusStr, xhr) {
              console.log('hello');
              console.log(data);
              $form.remove();
              $('.page').append(data.html);
            }
        });
      }
    });

    return Striper;
});
