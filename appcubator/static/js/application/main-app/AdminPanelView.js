define([
  'mixins/BackboneModal',
  'util'
],
function() {

  var AdminPanelView = Backbone.ModalView.extend({
    el: null,
    width: 520,
    height: 340,
    padding: 0,
    events: {

    },
    theme: null,

    initialize: function() {
      _.bindAll(this);
      this.render();
    },

    render: function() {
      var template = util.getHTML('admin-panel');
      if(!appUrl) {
        this.el.innerHTML = '<div style="padding:40px">You app needs to be deployed first.</div>';
        return;
      }
      this.el.innerHTML = _.template(template, { username:"admin", pwd: "password", url: appUrl + 'admin/'});
      return this;
    },

    logAdminPanel: function() {
      util.log_to_server('admin panel accessed', {}, appId);
    }
  });

  return AdminPanelView;
});
