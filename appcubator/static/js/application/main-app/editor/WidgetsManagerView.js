define([
  'editor/WidgetView',
  'editor/WidgetContainerView',
  'models/WidgetModel',
  'editor/WidgetEditorView',
  'editor/WidgetListView',
  'editor/WidgetFormView',
  'editor/WidgetSelectorView',
  'backbone'
],
function( WidgetView,
          WidgetContainerView,
          WidgetModel,
          WidgetEditorView,
          WidgetListView,
          WidgetFormView,
          WidgetSelectorView) {

  var WidgetManagerView = Backbone.View.extend({
    el : $('#page'),
    widgetsContainer : null,
    events : {

    },
    subviews: [],

    initialize: function(widgetsCollection) {
      _.bindAll(this);

      var self = this;
      this.subviews = [];

      this.widgetsCollection = widgetsCollection;
      this.listenTo(this.widgetsCollection, 'add', this.placeUIElement, true);

      this.widgetSelectorView = new WidgetSelectorView(this.widgetsCollection);

      this.listenTo(this.widgetsCollection, 'change', function() { util.askBeforeLeave(); });
      this.listenTo(this.widgetsCollection, 'add',  function() { util.askBeforeLeave(); });
    },

    render: function() {
      this.widgetsContainer = document.getElementById('elements-container');
      this.widgetsContainer.innerHTML = '';
      this.widgetsCollection.each(function(widget) {
        widget.setupPageContext(v1State.getCurrentPage());
        var newWidgetView = this.placeUIElement(widget, false);
      }, this);
      this.widgetSelectorView.setElement(this.widgetsContainer).render();
    },

    addWidgets: function(arrWidgets) {
      widget.setupPageContext(v1State.getCurrentPage());
      var newWidgetView = this.placeUIElement(widget, false);
    },

    // this function decides if widget or container
    placeUIElement: function(model, isNew) {
      model.setupPageContext(v1State.getCurrentPage());
      var widget = {};
      if(model.get('data').has('container_info') && model.get('data').get('container_info').has('row')) {
        widget = this.placeList(model, isNew);
      }
      else if(model.hasForm()) {
        widget = this.placeForm(model, isNew);
      }
      else if(model.get('data').has('container_info') || model.get('data').get('action') == "thirdpartylogin") {
        widget = this.placeContainer(model, isNew);
      }
      else {
        widget = this.placeWidget(model, isNew);
      }

      this.subviews.push(widget);
      return widget;
    },

    placeWidget: function(widgetModel, isNew) {
      var curWidget = new WidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else util.get('full-container').appendChild(curWidget.render().el);
      if(isNew) curWidget.autoResize();

      return curWidget;
    },

    placeContainer: function(containerWidgetModel, isNew) {
      var curWidget = new WidgetContainerView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else util.get('full-container').appendChild(curWidget.render().el);
      if(isNew) curWidget.autoResize();
      return curWidget;
    },

    placeList: function(containerWidgetModel, isNew) {
      var curWidget= new WidgetListView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else util.get('full-container').appendChild(curWidget.render().el);
      if(isNew) curWidget.autoResize();
      return curWidget;
    },

    placeForm: function(containerWidgetModel, isNew) {
      var curWidget= new WidgetFormView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.render().el);
      else util.get('full-container').appendChild(curWidget.render().el);
      if(isNew) curWidget.autoResize();
      return curWidget;
    },

    close: function() {
      this.widgetSelectorView.close();
      Backbone.View.prototype.remove.call(this);
    }
  });

  return WidgetManagerView;
});
