define([
  'editor/WidgetView',
  'editor/WidgetContainerView',
  'models/WidgetModel',
  'editor/WidgetEditorView',
  'editor/WidgetListView',
  'editor/WidgetSelectorView',
  'backbone'
],
function(WidgetView, WidgetContainerView, WidgetModel, WidgetEditorView, WidgetListView, WidgetSelectorView) {

  var WidgetManagerView = Backbone.View.extend({
    el : $('.page'),
    widgetsContainer : null,
    events : {

    },

    initialize: function(widgetsCollection) {
      _.bindAll(this);

      var self = this;

      this.widgetsCollection = widgetsCollection;
      this.widgetsCollection.bind('add', this.placeUIElement, true);

      this.widgetSelectorView = new WidgetSelectorView(this.widgetsCollection);

      this.widgetsCollection.bind('change', function() { iui.askBeforeLeave(); });
      this.widgetsCollection.bind('add',  function() { iui.askBeforeLeave(); });
    },

    render: function() {
      var self = this;
      this.widgetsContainer = document.getElementById('elements-container');
      this.widgetsContainer.innerHTML = '';
      self.widgetsCollection.each(function(widget) {
        widget.setupPageContext(v1State.getCurrentPage());
        self.placeUIElement(widget, false);
      });
      this.widgetSelectorView.setElement(this.widgetsContainer).render();
    },

    // this function decides if widget or container
    placeUIElement: function(model, isNew) {
      var self = this;
      model.setupPageContext(v1State.getCurrentPage());

      if(model.get('data').has('container_info') && model.get('data').get('container_info').has('row')) {
        self.placeList(model, isNew);
      }
      else if(model.get('data').has('container_info')) {
        self.placeContainer(model, isNew);
      }
      else {
        self.placeWidget(model, isNew);
      }
      model.trigger('rendered');
    },

    placeWidget: function(widgetModel, isNew) {
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else iui.get('full-container').appendChild(curWidget.render().el);

      if(isNew) curWidget.autoResize();
    },

    placeContainer: function(containerWidgetModel, isNew) {
      var curWidget = new WidgetContainerView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else iui.get('full-container').appendChild(curWidget.render().el);
      if(isNew) curWidget.autoResize();
    },

    placeList: function(containerWidgetModel, isNew) {
      var curWidget= new WidgetListView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else iui.get('full-container').appendChild(curWidget.render().el);
      if(isNew) curWidget.autoResize();
    }
  });

  return WidgetManagerView;
});