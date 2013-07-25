define([
  'mixins/SimpleDialogueView',
  'jquery',
  'backbone',
  'https://checkout.stripe.com/v2/checkout.js'
],
  function(SimpleModalView) {

    var Striper = Backbone.View.extend({

      initialize: function() {
        _.bindAll(this);
      },

      render: function() {
        return this;
      },

      bindPayment: function(selector, formId) {
        var self = this;
        this.action = formId;
        console.log(formId);

        $(selector).on('click', {token: this.token, formId: formId}, function(e, data) {
          if(formId === 'cancel-form') {
            $.ajax({
                 type: 'POST',
                 url: '/payments/a/cancel/',
                 data: {},
                 success: function(data, statusStr, xhr) {
                  self.showCancelModal(data);
                }
              });
          }
          else {
            self.checkoutOpen(e, data);
          }
        });
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
        var url = '';
        switch(this.action) {
          case 'cancel-form':
            url = '/payments/a/cancel/';
          default:
            url = '/payments/a/subscribe/';
        }
        $.ajax({
             type: 'POST',
             url: url,
             data: this.form.serialize(),
             success: function(data, statusStr, xhr) {
              form.remove();
              debugger;
              self.showPlanSuccessModal();
            }
        });
      },

      showPlanSuccessModal: function() {
        var self = this;
        var modal = new SimpleModalView({ text: "Thank you! Your payment has been received and your preferences has been saved."});
        modal.onClose = function() {
          self.onSuccess.call();
        };
      },

      showCancelModal: function(data) {
        var self = this;
        var modal = new SimpleModalView({ text: data.html });
        modal.onClose = function() {
          self.onSuccess.call();
        };
      }
    });

    return Striper;
});
