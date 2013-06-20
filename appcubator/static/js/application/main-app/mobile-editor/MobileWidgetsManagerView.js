define([
  'editor/WidgetsManagerView',
  'editor/WidgetView',
  'm-editor/MobileWidgetView',
  'm-editor/MobileWidgetContainerView',
  'models/WidgetModel',
  'editor/WidgetEditorView',
  'editor/WidgetListView',
  'm-editor/MobileWidgetSelectorView',
  'jquery-ui'
],
function(WidgetsManagerView,
         WidgetView,
         MobileWidgetView,
         MobileWidgetContainerView,
         WidgetModel,
         WidgetEditorView,
         WidgetListView,
         MobileWidgetSelectorView) {

  var MobileWidgetManagerView = WidgetsManagerView.extend({
    el : $('.page'),
    widgetsContainer : null,
    events : {

    },

    initialize: function(widgetsCollection) {
      _.bindAll(this);

      var self = this;

      this.widgetsCollection = widgetsCollection;
      this.widgetsCollection.bind('add', this.placeUIElement);

      this.widgetSelectorView = new MobileWidgetSelectorView(this.widgetsCollection);

      this.widgetsCollection.bind('change', function() { util.askBeforeLeave(); });
      this.widgetsCollection.bind('add',  function() { util.askBeforeLeave(); });
    },

    render: function() {
      var self = this;
      this.widgetsContainer = document.getElementById('elements-container');
      this.widgetsContainer.innerHTML = '';

      var models = _(self.widgetsCollection.models).sortBy(function(widget) {
        return widget.get('layout').get('order');
      });

      _(models).each(function(widget) {
        self.placeUIElement(widget);
      });

      this.widgetSelectorView.setElement(this.widgetsContainer).render();

      $( "#elements-container" ).sortable({
        placeholder: "ui-state-highlight",
        stop: this.positionChanged,
      });
    },

    placeWidget: function(widgetModel) {
      var curWidget = new MobileWidgetView(widgetModel);

      if(!widgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else util.get('full-container').appendChild(curWidget.el);
    },

    placeContainer: function(containerWidgetModel) {
      var curWidget= new MobileWidgetContainerView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else util.get('full-container').appendChild(curWidget.el);
    },

    placeList: function(containerWidgetModel) {
      var curWidget= new WidgetListView(containerWidgetModel);
      if(!containerWidgetModel.isFullWidth()) this.widgetsContainer.appendChild(curWidget.el);
      else util.get('full-container').appendChild(curWidget.el);
    },

    positionChanged: function(e, ui) {
      var self = this;
      var arr = $( "#elements-container" ).sortable("toArray");
      arr = _.reject(arr, function(str) { return (str == "hover-div" || str == "select-div"); });
      _.each(arr, function(val, ind) {
        var cid = val.replace('widget-wrapper-','');
        self.widgetsCollection.get(cid).get('layout').set('order', ind);
      });
    }
  });

  return MobileWidgetManagerView;
});
