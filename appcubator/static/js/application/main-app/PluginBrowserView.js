define([
  'mixins/BackboneModal',
  'util'
],
function() {

  var PluginBrowserView = Backbone.ModalView.extend({
    className: "plugin-browser-panel",
    width: 800,
    height: 630,
    events: {
      'click .addPluginButton': 'addPlugin'
    },
    initialize: function(data) {
      _.bindAll(this);
      this.data = data;
      this.render();
    },
    render: function() {
      var template = util.getHTML('plugin-browser');
      console.log(this.data);
      console.log(template);
      this.el.innerHTML = _.template(template, {});
      return this;
    },
    addPlugin: function(){
      console.log("Add Plugin!");
    },
    close: function() {
      if(this.g_js) { this.g_js.parentNode.removeChild(this.g_js); }
      PluginBrowserView.__super__.close.call(this);
    }
  });

  return PluginBrowserView;
});
