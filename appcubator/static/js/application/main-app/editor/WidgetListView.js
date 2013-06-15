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
      'mouseout'      : 'unhovered'
    },

    initialize: function(widgetModel) {
      WidgetContainerView.__super__.initialize.call(this, widgetModel);
      _.bindAll(this);

      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.placeWidget);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.renderShadowElements);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("remove", this.renderShadowElements);
      this.model.bind('deselected', this.deselected);

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
        this.placeWidget(widgetModel);
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
      this.$el.find('.row').first().addClass('highlighted');
    },

    placeWidget: function(widgetModel) {
      widgetModel.setupLoopContext(this.entityModel);
      var widgetView = new WidgetView(widgetModel, true);
      this.editorRow.appendChild(widgetView.render().el);
      widgetModel.get('layout').bind('change', this.renderShadowElements);
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
