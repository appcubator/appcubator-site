define([
  'mixins/BackboneModal'
],
function() {

  var CustomWidgetEditorModal = Backbone.ModalView.extend({
    className : 'custom-widget-editor',
    width  : 540,
    title: "Custom Widget Editor",

    events : {
      'keydown #edit-css-inp' : 'cssEdited',
      'keydown #edit-js-inp'  : 'jsEdited',
      'keydown #edit-html-inp': 'htmlEdited'
    },

    initialize: function(widgetModel){
      _.bindAll(this);
      this.model = widgetModel;
      this.render();
    },

    render: function() {
      var self = this;
      var htmlStr = this.model.get('data').get('htmlC')||'';
      var cssStr  = this.model.get('data').get('cssC')||'';
      var jsStr   = this.model.get('data').get('jsC')||'';

      this.el.innerHTML = '<textarea id="edit-html-inp">'+htmlStr+'</textarea><br><textarea id="edit-js-inp">'+jsStr+'</textarea><br><textarea id="edit-css-inp">'+cssStr+'</textarea>';
      
      return this;
    },

    cssEdited: function(e) {
      if(!e.currentTarget.value.length) return;
      this.model.get('data').set('cssC', e.currentTarget.value);
    },

    jsEdited: function(e) {
      if(!e.currentTarget.value.length) return;
      this.model.get('data').set('jsC', e.currentTarget.value);
    },

    htmlEdited: function(e) {
      if(!e.currentTarget.value.length) return;
      this.model.get('data').set('htmlC', e.currentTarget.value);
    }

  });

  return CustomWidgetEditorModal;
});