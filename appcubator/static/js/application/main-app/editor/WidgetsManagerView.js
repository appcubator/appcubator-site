define([
  'editor/WidgetView',
  'editor/WidgetContainerView',
  'models/WidgetModel',
  'editor/WidgetEditorView',
  'editor/WidgetListView',
  'editor/WidgetFormView',
  'editor/WidgetSelectorView',
  'editor/WidgetCustomView',
  'editor/CustomWidgetEditorModal',
  'backbone'
],
function( WidgetView,
          WidgetContainerView,
          WidgetModel,
          WidgetEditorView,
          WidgetListView,
          WidgetFormView,
          WidgetSelectorView,
          WidgetCustomView,
          CustomWidgetEditorModal) {

  var WidgetManagerView = Backbone.View.extend({
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

    render: function(proxy) {
      this.proxy = proxy;
      
      var innerDoc = this.el.contentDocument || this.el.contentWindow.document;
      this.widgetsContainer = innerDoc.getElementById('elements-container');
      this.widgetsContainer.innerHTML = '';
      
      this.widgetsCollection.each(function(widget) {
        widget.setupPageContext(v1State.getCurrentPage());
        var newWidgetView = this.placeUIElement(widget, false);
      }, this);


      this.widgetSelectorView.setElement(innerDoc).render();
    },

    addWidgets: function(arrWidgets) {
      widget.setupPageContext(v1State.getCurrentPage());
      var newWidgetView = this.placeUIElement(widget, false);
    },

    // this function decides if widget or container
    placeUIElement: function(model, isNew, extraData) {
      if(extraData && extraData.collection) { isNew = false; }

      model.setupPageContext(v1State.getCurrentPage());
      var widget = {};
      if(model.get('data').has('container_info') && model.get('data').get('container_info').has('row')) {
        widget = this.proxy.placeList(model, isNew);
      }
      else if(model.hasForm()) {
        widget = this.proxy.placeForm(model, isNew);
      }
      else if(model.get('data').has('container_info') || model.get('data').get('action') == "thirdpartylogin") {
        widget = this.proxy.placeContainer(model, isNew);
      }
      else if(model.get('type') == 'custom') {
        widget = this.proxy.placeCustomWidget(model, isNew);
      }
      else {
        widget = this.proxy.placeWidget(model, isNew);
      }

      this.subviews.push(widget);
      return widget;
    },

    close: function() {
      this.widgetSelectorView.close();
      WidgetManagerView.__super__.close.call(this);
    }
  });

  return WidgetManagerView;
});
