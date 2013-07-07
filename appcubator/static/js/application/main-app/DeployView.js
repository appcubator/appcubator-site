define([
  'mixins/BackboneModal'
],
function() {

  var DeployView = Backbone.ModalView.extend({
    el: null,
    className: "deploy-panel",
    width: 620,
    height: 370,
    events: {

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

      !function(d,s,id){var js,fjs=d.getElementsByTagName(s)[0],p=/^http:/.test(d.location)?'http':'https';if(!d.getElementById(id)){js=d.createElement(s);js.id=id;js.src=p+'://platform.twitter.com/widgets.js';fjs.parentNode.insertBefore(js,fjs);}}(document, 'script', 'twitter-wjs');
      return this;
    }
  });

  return DeployView;
});
