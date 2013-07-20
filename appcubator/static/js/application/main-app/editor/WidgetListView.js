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
    className: 'container-create list-widget',
    tagName : 'div',
    entity: null,
    type: null,
    highlighted: false,
    subviews: [],

    positionHorizontalGrid : 80,
    positionVerticalGrid   : 15,

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

      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.placeWidget, true, true);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("add", this.renderShadowElements);
      this.model.get('data').get('container_info').get('row').get('uielements').bind("remove", this.renderShadowElements);
      this.model.bind('deselected', function() {
        this.model.trigger('editModeOff');
      }, this);

      this.model.bind('editModeOff', this.switchEditingOff);
      this.model.get('data').get('container_info').get('row').get('layout').bind('change:height', this.renderShadowElements);

      var action = this.model.get('data').get('container_info').get('action');

      this.entityModel = this.model.get('data').get('container_info').get('entity');
      this.model.bind('highlight', this.highlightFirstRow);
      this.widgetSelectorView = new ListWidgetSelectorView(this.model.get('data').get('container_info').get('row').get('uielements'), this.el);
      this.subviews.push(this.widgetSelectorView);
    },


    render: function() {
      var self = this;
      var form;

      this.el.innerHTML = '';

      var width = this.model.get('layout').get('width');
      var height = this.model.get('layout').get('height');

      this.setTop(this.positionVerticalGrid * this.model.get('layout').get('top'));
      this.setLeft(this.positionHorizontalGrid * this.model.get('layout').get('left'));
      this.setHeight(height * this.positionVerticalGrid);

      this.el.className += ' widget-wrapper span'+width;
      this.el.id = 'widget-wrapper-' + this.model.cid;

      var row = this.model.get('data').get('container_info').get('row');

      var editorRow = document.createElement('div');
      editorRow.className = "row block hi" + row.get('layout').get('height');
      this.editorRow = editorRow;

      row.get('uielements').map(function(widgetModel) {
        this.placeWidget(widgetModel, false);
      }, this);
      this.widgetSelectorView.setElement(this.el).render();

      this.shadowElements = document.createElement('div');
      var listDiv = document.createElement('div');
      listDiv.className = this.model.get('data').get('class_name');
      this.listDiv = listDiv;
      this.listDiv.appendChild(editorRow);
      this.listDiv.appendChild(this.renderShadowElements());

      this.el.appendChild(this.listDiv);
      return this;
    },

    renderShadowElements: function() {
      var row = this.model.get('data').get('container_info').get('row');
      var uielements = _.map(row.get('uielements').models, function(obj) { return obj.attributes; });
      this.shadowElements.innerHTML = _.template(Templates.listNode, {layout: row.get('layout'),
                                                          uielements: uielements,
                                                          isListOrGrid: row.get('isListOrGrid')});

      if(this.editMode) { $('.fdededfcbcbcd .shadow-x').addClass('trans'); }
      return this.shadowElements;
    },

    showDetails: function() {

    },

    highlightFirstRow: function() {
      var self = this;
      this.editMode = true;
      this.highlighted = true;
      this.$el.addClass('selected');
      $(this.editorRow).resizable({
        handles: "s",
        grid: [ 20, 15 ],
        stop  : self.resized
      });
      $(this.editorRow).addClass('highlighted');

      $('.fdededfcbcbcd .shadow-x').addClass('trans');
    },

    placeWidget: function(widgetModel, isNew) {
      widgetModel.setupLoopContext(this.entityModel);
      var widgetView = new WidgetView(widgetModel);
      widgetView.setFreeMovement();

      this.editorRow.appendChild(widgetView.render().el);

      this.deepListenTo(widgetModel, 'change', this.renderShadowElements);

      if(isNew) { widgetView.autoResize(); }
    },

    resized: function(e, ui) {
      var deltaHeight = Math.round((ui.size.height + 6) / this.positionVerticalGrid);
      var elem = util.get('widget-wrapper-' + this.model.cid);
      elem.style.width = '';
      elem.style.height = '';
      this.model.get('data').get('container_info').get('row').get('layout').set('height', deltaHeight);
    },

    autoResize: function() {
      var left = this.model.get('layout').get('left');
      var width = 12 - left;
      if(width > 7) width = 7;

      this.model.get('layout').set('width', width);
      this.model.get('layout').set('height', 46);
    },

    changedType: function(a) {
      this.listDiv.className = this.model.get('data').get('class_name');
    },

    switchEditingOff: function() {
      this.editMode = false;
      this.$el.removeClass('selected');
      this.$el.find('.row').first().removeClass('highlighted');
      this.widgetSelectorView.deselect();
      if(this.highlighted) $(this.editorRow).resizable("destroy");
      $('.shadow-x.trans').removeClass('trans');
      this.highlighted = false;
    }

  });

  return WidgetListView;
});
