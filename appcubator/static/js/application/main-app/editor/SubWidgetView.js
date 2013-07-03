define([
  'collections/WidgetCollection',
  'editor/QueryEditorView',
  'editor/WidgetView',
  'backbone',
  'editor/editor-templates'
],function(WidgetCollection, QueryEditorView, WidgetView) {

  var SubWidgetView = WidgetView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,
    events: {
      'click' : 'select'
    },

    initialize: function(widgetModel) {
      SubWidgetView.__super__.initialize.call(this, widgetModel);
    },

    select: function() { }
  });

  return SubWidgetView;
});