define([
  'editor/WidgetContainerView',
  'editor/WidgetView',
  'editor/list-editor/ListWidgetSelectorView',
  'dicts/constant-containers',
  'editor/editor-templates'
],
function( WidgetContainerView,
          WidgetView,
          ListWidgetSelectorView ) {

  var WidgetListView = WidgetContainerView.extend({
    el: null,
    className: 'container-create',
    tagName : 'div',
    entity: null,
    type: null,
    events: {
      'click'         : 'select',
      'click .delete' : 'remove',
      'mouseover'     : 'hovered',
      'mouseout'      : 'unhovered',
      'mousedown .row': 'rowMousedown',
      'mouseup .row'  : 'rowMouseup'
    },

    rowMousedown: function() { mouseDispatcher.isMousedownActive = true; },
    rowMouseup:   function() { mouseDispatcher.isMousedownActive = false; },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this);

      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.placeWidget, true);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.renderShadowElements);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("remove", this.renderShadowElements);
      this.model.bind('deselected', this.deselected);

      this.model.get('data').get('container_info').get('row').get('layout').bind('change:height', this.renderShadowElements);

      var action = this.model.get('data').get('container_info').get('action');

      this.entityModel = this.model.get('data').get('container_info').get('entity');
      this.model.bind('highlight', this.highlightFirstRow);
      this.widgetSelectorView = new ListWidgetSelectorView(this.model.get('data').get('container_info').get('row').get('uielements'));
      this.rowBindings();
    },

    rowBindings: function() {
      var self = this;
      self.model.get('data').get('container_info').get('row').get('uielements').each(function(element) {
        element.get('layout').bind('change', self.renderShadowElements);
        element.get('data').bind('change', self.renderShadowElements);
      });
    },

    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(GRID_HEIGHT * this.model.get('layout').get('top'));
      this.setLeft(GRID_WIDTH * this.model.get('layout').get('left'));
      this.setHeight(height * GRID_HEIGHT);

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

      var row = this.model.get('data').get('container_info').get('row');

      var editorRow = document.createElement('div');
      editorRow.className = "row block hi" + row.get('layout').get('height');
      this.editorRow = editorRow;

      row.get('uielements').map(function(widgetModel) {
        widgetModel.setupLoopContext(this.entityModel);
        this.placeWidget(widgetModel, false);
      }, this);
      this.widgetSelectorView.setElement(this.el).render();

      this.el.appendChild(editorRow);
      var listDiv = document.createElement('div');
      this.listDiv = listDiv;
      this.el.appendChild(this.renderShadowElements());

      return this;
    },

    renderShadowElements: function() {
      var row = this.model.get('data').get('container_info').get('row');
      var uielements = _.map(row.get('uielements').models, function(obj) { return obj.attributes; });
      this.listDiv.innerHTML = _.template(Templates.listNode, {layout: row.get('layout'),
                                                          uielements: uielements,
                                                          isListOrGrid: row.get('isListOrGrid')});
      return this.listDiv;
    },

    showDetails: function() {

    },

    highlightFirstRow: function() {
      var self = this;
      $(this.editorRow).resizable({
        handles: "s",
        grid: [ 20, 15 ],
        stop  : self.resized
      });
      $(this.editorRow).addClass('highlighted');
    },

    placeWidget: function(widgetModel, isNew) {
      widgetModel.setupLoopContext(this.entityModel);
      var widgetView = new WidgetView(widgetModel, true);
      this.editorRow.appendChild(widgetView.render().el);
      widgetModel.get('layout').bind('change', this.renderShadowElements);
      if(isNew) widgetView.autoResize();
    },

    resized: function(e, ui) {
      var deltaHeight = Math.round((ui.size.height + 6) / GRID_HEIGHT);
      var elem = iui.get('widget-wrapper-' + this.model.cid);
      elem.style.width = '';
      elem.style.height = '';
      this.model.get('data').get('container_info').get('row').get('layout').set('height', deltaHeight);
    },

    deselected: function() {
      this.editMode = false;
      this.$el.find('.row').first().removeClass('highlighted');
      this.model.trigger('editModeOff');
      this.widgetSelectorView.deselect();
    }

  });

  return WidgetListView;
});
