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

      this.widgetsCollection = widgetsCollection;
      this.widgetsCollection.bind('add', this.placeUIElement, true);

      this.widgetSelectorView = new WidgetSelectorView(this.widgetsCollection);

      this.widgetsCollection.bind('change', function() { util.askBeforeLeave(); });
      this.widgetsCollection.bind('add',  function() { util.askBeforeLeave(); });
    },

    render: function() {
      this.widgetsContainer = document.getElementById('elements-container');
      this.widgetsContainer.innerHTML = '';
      this.widgetsCollection.each(function(widget) {
        widget.setupPageContext(v1State.getCurrentPage());
        var newWidgetView = this.placeUIElement(widget, false);
        this.subviews.push(newWidgetView);
      }, this);
      this.widgetSelectorView.setElement(this.widgetsContainer).render();
    },

    // this function decides if widget or container
    placeUIElement: function(model, isNew) {
      model.setupPageContext(v1State.getCurrentPage());

      if(model.get('data').has('container_info') && model.get('data').get('container_info').has('row')) {
        return this.placeList(model, isNew);
      }
      else if(model.hasForm()) {
        return this.placeForm(model, isNew);
      }
      else if(model.get('data').has('container_info') || model.get('data').get('action') == "thirdpartylogin") {
        return this.placeContainer(model, isNew);
      }
      else {
        return this.placeWidget(model, isNew);
      }
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

    remove: function() {
      this.widgetSelectorView.close();
      Backbone.View.prototype.remove.call(this);
    }
  });

  return WidgetManagerView;
});
