define([
  'mixins/BackboneModal',
  'util'
],
function() {

  var DeployView = Backbone.ModalView.extend({
    el: null,
    className: "deploy-panel",
    width: 620,
    height: 370,
    events: {
      'click .download-pane': 'downloaded'
    },
    theme: null,

    initialize: function(data) {
      _.bindAll(this);
      this.data = data;
      this.render();
    },

    render: function() {
      var template = util.getHTML('deploy-panel');
      this.el.innerHTML = _.template(template, this.data);
      this.g_js = {};
      var self = this;
      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s); self.g_js = js; js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
      return this;
    },

    downloaded: function() {
        $(".download-pane .loading-wheel").css('visibility','visible')
        var hideWheel = function() {
            $(".download-pane .loading-wheel").css('visibility','hidden');
        }
        v1.currentApp.download(hideWheel);
    },

    close: function() {
      if(this.g_js) { this.g_js.parentNode.removeChild(this.g_js); }
      DeployView.__super__.close.call(this);
    }
  });

  return DeployView;
});
