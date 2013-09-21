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

      bindChangeCard: function(selector, formId) {
        var self = this;
        $(selector).on('click', {token: this.tokenChangeCard, formId: formId}, this.checkoutOpen);
      },

      bindChangePlan: function(selector, formId) {
        var self = this;
        $(selector).on('click', {token: this.tokenChangePlan, formId: formId}, this.tokenChangePlan);
      },

      bindCancel: function(selector, formId) {
        var self = this;
        $(selector).on('click', {token: this.tokenCancel, formId: formId}, this.tokenCancel);
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

      tokenChangeCard: function(result) {
        var self = this;
        var form = this.form;
        this.form.find("input[name=stripe_token]").val(result.id);
        console.log("Calling AJAX");
        $.ajax({
             type: 'POST',
             url: '/payments/a/change/card/',
             data: this.form.serialize(),
             success: function(data, statusStr, xhr) {
              console.log(data);
              form.remove();
              location.reload();
              // self.showPlanSuccessModal(data.html);
            },
            complete: function (data) {
              console.log(data);
            }
        });
      },

      tokenChangePlan: function(e) {
        e.preventDefault();
        var self = this;
        var form = $('#' + e.data.formId);
        // form.find("input[name=stripe_token]").val(e.id);
        $.ajax({
             type: 'POST',
             url: '/payments/a/change/plan/',
             data: form.serialize(),
             success: function(data, statusStr, xhr) {
              console.log(data);
              if (data.error.length > 0) {
                self.showPlanSuccessModal(data.error);                
              } else {
                self.showPlanSuccessModal("You are succesfully subscribed.");
              }
            }
        });
      },

      tokenCancel: function(data) {
        var self = this;
        var form = $('#' + e.data.formId);
        // form.find("input[name=stripe_token]").val(result.id);
        $.ajax({
             type: 'POST',
             url: '/payments/a/cancel/',
             data: form.serialize(),
             success: function(data, statusStr, xhr) {
              form.remove();
              // self.showPlanSuccessModal();
            }
        });
      },

      showPlanSuccessModal: function(html) {
        var self = this;
        var text = (html||"Thank you! Your payment has been received and your preferences has been saved.");
        var modal = new SimpleDialogueView({ text: text});
        modal.onClose = function() {
          //self.onSuccess.call();
          location.reload();
        };
      }
    });

    return Striper;
});
