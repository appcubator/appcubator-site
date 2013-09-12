define([
  'collections/EmailCollection',
  'models/EmailModel',
  'app/emails/EmailView',
  'mixins/BackboneNameBox'
],
function(EmailCollection, EmailModel, EmailView) {

  var EmailsView = Backbone.View.extend({
    events: {
      'click #ganalytics-btn': 'googleAnalytics',
      'click #paypal-btn'    : 'paypal',
      'click #suggestions-btn':'suggestions',
      'click .suggestions'   : 'suggestions'
    },

    subviews: [],

    initialize: function() {
      _.bindAll(this);
    },

    render: function() {
      this.el.innerHTML = _.template(util.getHTML('plugins-page'), {});
      this.setupDisqus();
      return this;
    },

    googleAnalytics: function() {
      this.$el.find('#disqus-thread').hide();
      this.$el.find('#google-analytics').show();
      this.$el.find('#paypal').hide();
    },

    paypal: function() {
      this.$el.find('#disqus-thread').hide();
      this.$el.find('#google-analytics').hide();
      this.$el.find('#paypal').show();
    },

    suggestions: function() {
      this.$el.find('#disqus-thread').show();
      this.$el.find('#google-analytics').hide();
      this.$el.find('#paypal').hide();
    },

    setupDisqus: function() {
          var disqus_shortname = 'appcubator'; // required: replace example with your forum shortname
          var disqus_url = 'http://appcubator.com/plugins/suggestions/';
            /* * * DON'T EDIT BELOW THIS LINE * * */
            (function() {
                var dsq = document.createElement('script'); dsq.type = 'text/javascript'; dsq.async = true;
                dsq.src = '//' + disqus_shortname + '.disqus.com/embed.js';
                (document.getElementsByTagName('head')[0] || document.getElementsByTagName('body')[0]).appendChild(dsq);
            })();
    }

  });

  return EmailsView;
});
