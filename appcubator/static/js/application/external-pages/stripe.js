define([
  'jquery',
  'http://checkout.stripe.com/v2/checkout.js'
],
  function() {

    var StripeMain = function() {
  	$('body').on("click", '.change-card, .subscribe-form button[type=submit]', function(e) {
		  e.preventDefault();
  		var $form = $(this).closest("form"),
  		token = function(res) {
  		    $form.find("input[name=stripe_token]").val(res.id);
  		   // $form.trigger("submit");
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
          })
  		};
		
		  StripeCheckout.open({
  			key:         $form.data("stripe-key"),
  			name:        'Payment Method',
  			panelLabel:  'Add Payment Method',
  			token:       token
		  });
		
		  return false;
    });
  };

  return StripeMain

});
