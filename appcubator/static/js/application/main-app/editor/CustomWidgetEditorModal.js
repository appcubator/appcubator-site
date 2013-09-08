define([
  'mixins/BackboneModal',
  'ace'
],
function() {

  var CustomWidgetEditorModal = Backbone.ModalView.extend({
    className : 'custom-widget-editor',
    width  : 540,
    height: 540,
    title: "Custom Widget Editor",
    doneButton: true,

    events : {
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

      this.el.innerHTML = 'HTML<br><div id="edit-html-inp" style="background-color:#eee; height: 100px; width:480px; position:relative;"></div><br>JS<br><div id="edit-js-inp" style="position:relative; background-color:#eee; height: 100px; width:480px;"></div><br>CSS<br><div id="edit-css-inp" style="background-color:#eee; height: 100px; width:480px;"></div>';
      
      this.CSSeditor = ace.edit("edit-css-inp");
      this.CSSeditor.getSession().setMode("ace/mode/css");
      this.CSSeditor.setValue(cssStr, -1);

      this.HTMLeditor = ace.edit("edit-html-inp");
      this.HTMLeditor.getSession().setMode("ace/mode/html");
      this.HTMLeditor.setValue(htmlStr, -1);

      this.JSeditor = ace.edit("edit-js-inp");
      this.JSeditor.getSession().setMode("ace/mode/javascript");
      this.JSeditor.setValue(jsStr, -1);

      return this;
    },

    onClose: function() {
      this.model.get('data').set('cssC', this.CSSeditor.getValue());
      this.model.get('data').set('jsC', this.JSeditor.getValue());
      this.model.get('data').set('htmlC', this.HTMLeditor.getValue());
      this.model.trigger('custom_edited');
    }

  });

  return CustomWidgetEditorModal;
});