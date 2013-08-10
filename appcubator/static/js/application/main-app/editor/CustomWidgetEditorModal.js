define([
  'mixins/BackboneModal'
],
function() {

  var CustomWidgetEditorModal = Backbone.ModalView.extend({
    className : 'custom-widget-editor',
    width  : 540,
    height: 540,
    title: "Custom Widget Editor",
    doneButton: true,

    events : {
      // 'keydown #edit-css-inp' : 'cssEdited',
      // 'keydown #edit-js-inp'  : 'jsEdited',
      // 'keydown #edit-html-inp': 'htmlEdited'
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

      this.el.innerHTML = 'HTML<br><textarea id="edit-html-inp">'+htmlStr+'</textarea><br>JS<br><textarea id="edit-js-inp">'+jsStr+'</textarea><br>CSS<br><textarea id="edit-css-inp">'+cssStr+'</textarea>';
      
      return this;
    },

    onClose: function() {
      this.model.get('data').set('cssC', $('#edit-css-inp').val());
      this.model.get('data').set('jsC', $('#edit-js-inp').val());
      this.model.get('data').set('htmlC', $('#edit-html-inp').val());
      this.model.trigger('custom_edited');
    }

  });

  return CustomWidgetEditorModal;
});