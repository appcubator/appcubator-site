define([
  'mixins/BackboneConvenience',
  'mixins/BackboneModal',
  'util'
],
function() {

  var ShareModalView = Backbone.ModalView.extend({
    el: null,
    className: "deploy-panel",
    width: 600,
    height: 340,
    events: {
      'click .download-pane': 'logDownload'
    },
    theme: null,

    initialize: function(data) {
      _.bindAll(this);
      this.data = data;
      this.render();
    },

    render: function() {
      var template = util.getHTML('share-panel');
      this.el.innerHTML = _.template(template, {site_url : appUrl});

      this.g_js = {};
      var self = this;
      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s); self.g_js = js; js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
      return this;
    },

    logDownload: function() {
      util.log_to_server('code downloaded', {}, appId);
    },

    close: function() {
      this.g_js.parentNode.removeChild(this.g_js);
      ShareModalView.__super__.close.call(this);
    }
  });

  return ShareModalView;
});
