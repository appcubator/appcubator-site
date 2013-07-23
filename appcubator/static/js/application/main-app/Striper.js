define([
  'mixins/SimpleDialogueView',
  'jquery',
  'backbone',
  'https://checkout.stripe.com/v2/checkout.js'
],
  function(SimpleDialogueView) {

    var Striper = Backbone.View.extend({

      initialize: function() {
        _.bindAll(this);
      },

      render: function() {
        return this;
      },

      bindPayment: function(selector, formId) {
        var self = this;
        $(selector).on('click', {token: this.token, formId: formId}, this.checkoutOpen);
      },

      checkoutOpen: function(e) {
        e.preventDefault();
        this.form = $('#' + e.data.formId);
        StripeCheckout.open({
          key       :   $('#' + e.data.formId).data("stripe-key"),
          name      :  'Payment Method',
          panelLabel:  'Add Payment Method',
          token     :   e.data.token
        });
      },

      token: function(result) {
        var self = this;
        var form = this.form;
        this.form.find("input[name=stripe_token]").val(result.id);
        $.ajax({
             type: 'POST',
             url: '/payments/a/subscribe/',
             data: this.form.serialize(),
             success: function(data, statusStr, xhr) {
              form.remove();
              self.showPlanSuccessModal();
            }
        });
      },

      showPlanSuccessModal: function() {
        var self = this;
        var modal = new SimpleDialogueView({ txt: "Thank you! Your payment has been received and your preferences has been saved."});
        modal.onClose = function() {
          self.onSuccess.call();
        };
      }
    });

    return Striper;
});
